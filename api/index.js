import * as dotenv from "dotenv";
dotenv.config();
import express, { response } from "express";
import pkg from "@prisma/client";
import morgan from "morgan";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import { amadeus } from "./amadeusAuth.js";

const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// Middleware to verify JWT token sent by the client
function requireAuth(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // attaching the user id to the request object, this will make it available in the endpoints that use this middleware
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

// this is a public endpoint because it doesn't have the requireAuth middleware
app.get("/ping", (req, res) => {
  res.send("pong");
});

app.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: { email, password: hashedPassword, name },
    select: { id: true, email: true, name: true },
  });

  const payload = { userId: newUser.id };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
  res.cookie("token", token, { httpOnly: true, maxAge: 15 * 60 * 1000 });

  res.json(newUser);
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const payload = { userId: user.id };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
  res.cookie("token", token, { httpOnly: true, maxAge: 15 * 60 * 1000 });

  // ensure that the password is not sent to the client
  const userData = {
    id: user.id,
    email: user.email,
    name: user.name,
  };

  res.json(userData);
});

app.post("/logout", async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

// requireAuth middleware will validate the access token sent by the client and will return the user information within req.auth
app.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true, name: true },
  });
  res.json(user);
});

app.post("/itinerary", requireAuth, async (req, res) => {
  const userId = req.userId;
  const name = req.body.name;
  const existingItinerary = await prisma.itinerary.findUnique({
    where: { id: userId, name: name },
  });
  if (existingItinerary) {
    return res.status(400).json({ error: "User already exists" });
  }
  const newItinerary = await prisma.itinerary.create({
    data: { name, userId },
    select: { id: true, name: true },
  });
  res.json(newItinerary);
});

app.post("/flights", async function (req, res) {
  const departureDate = req.body.departureDate;
  const returnDate = req.body.returnDate;
  const originLocationCode = req.body.originLocationCode;
  const destinationLocationCode = req.body.destinationLocationCode;
  const adults = req.body.adults;
  const children = req.body.children;
  const infants = req.body.infants;
  const travelClass = req.body.travelClass;
  const nonStop = req.body.nonStop;
  const maxPrice = req.body.maxPrice;
  const currencyCode = req.body.currencyCode;
  const includedAirlineCodes = req.body.includedAirlineCodes;
  const excludedAirlineCodes = req.body.excludedAirlineCodes;
  const max = req.body.max;
  const response = await amadeus.shopping.flightOffersSearch
    .get({
      originLocationCode: originLocationCode,
      destinationLocationCode: destinationLocationCode,
      departureDate: departureDate,
      returnDate: returnDate,
      max: max,
      adults: adults,
      children: children,
      infants: infants,
      travelClass: travelClass,
      nonStop: nonStop,
      maxPrice: maxPrice,
      currencyCode: currencyCode,
      includedAirlineCodes: includedAirlineCodes,
      excludedAirlineCodes: excludedAirlineCodes,
    })
    .catch((err) => console.log(err));

  try {
    const responseBody = await JSON.parse(response.body);
    const flightOffers = responseBody.data;

    const extractedFlights = [];

    flightOffers.forEach((flight) => {
      const price = {
        total: flight.price.total,
        currency: flight.price.currency,
      };
      const flightPairs = [];
      let carriers = responseBody.dictionaries.carriers;

      flight.itineraries.forEach((itinerary) => {
        const segments = itinerary.segments;
        if (segments.length === 0) return;

        const originCode = segments[0].departure.iataCode;
        const arrivalCode = segments[segments.length - 1].arrival.iataCode;

        const departureTime = segments[0].departure.at;
        const arrivalTime = segments[segments.length - 1].arrival.at;

        const duration = itinerary.duration;

        const nonStop =
          segments.length === 1 ||
          segments.every((seg) => seg.numberOfStops === 0);

        const numberOfStops = segments.reduce(
          (acc, seg) => acc + seg.numberOfStops,
          0
        );

        const segmentsDetails = segments.map((seg) => ({
          airlineName: carriers[seg.carrierCode] || seg.carrierCode,
          flightNumber: seg.number,
        }));

        flightPairs.push({
          originCode,
          arrivalCode,
          departureTime,
          arrivalTime,
          duration,
          nonStop,
          numberOfStops,
          price,
          segmentsDetails,
        });
      });
      extractedFlights.push(flightPairs);
    });

    console.log("Extracted Flight Information:", extractedFlights);
    res.json(extractedFlights);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    res.json(error);
  }
});

app.post("/addFlight", requireAuth, async function (req, res) {
  const userId = req.userId;
  const flightName = req.body.flightName;
  const airlineName = req.body.airlineName;
  const source = req.body.source;
  const destination = req.body.destination;
  const departureDate = req.body.departureDate;
  const returnDate = req.body.returnDate;
  const price = parseFloat(req.body.price);

  try {
    const flight = await prisma.flight.create({
      data: {
        flightName,
        airlineName,
        source,
        destination,
        departureDate: new Date(departureDate),
        returnDate: new Date(returnDate),
        price,

        User: {
          connect: { id: userId },
        },
      },
    });

    res.json(flight);
  } catch (error) {
    console.error("Error creating flight: ", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the flight." });
  }
});
app.listen(8000, () => {
  console.log("Server running on http://localhost:8000 🎉 🚀");
});
