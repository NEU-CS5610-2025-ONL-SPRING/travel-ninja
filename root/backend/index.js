import * as dotenv from "dotenv";
dotenv.config();
import express, { response } from "express";
import pkg from "@prisma/client";
import morgan from "morgan";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import {amadeus} from './amadeusAuth.js';

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
  // password: 123456
  // user.password: $2b$10$naV1eAwirV13nyBYVS96W..52QzN8U/UQ7mmi/IEEVJDtCAdDmOl2
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

app.post("/flights", async function (req, res) {
  console.log(req.body);
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
      excludedAirlineCodes: excludedAirlineCodes
    })
    .catch((err) => console.log(err));

  try {
    const responseBody = await JSON.parse(response.body);
    const flightOffers = responseBody.data;
    
    // Array to store the extracted flight details
  const extractedFlights = [];
  
  // Iterate over each flight offer
  flightOffers.forEach(flight => {
    // Extract price details from the flight offer
    const price = {
      total: flight.price.total,
      currency: flight.price.currency
    };

    let carriers = responseBody.dictionaries.carriers;

    // Iterate over each itinerary in the flight offer
    flight.itineraries.forEach(itinerary => {
      const segments = itinerary.segments;
      if (segments.length === 0) return; // Skip if no segments
      
      // Extract origin and arrival codes from first and last segments respectively
      const originCode = segments[0].departure.iataCode;
      const arrivalCode = segments[segments.length - 1].arrival.iataCode;
      
      // Extract departure time from the first segment and arrival time from the last segment
      const departureTime = segments[0].departure.at;
      const arrivalTime = segments[segments.length - 1].arrival.at;
      
      // Itinerary duration is given directly in the itinerary
      const duration = itinerary.duration;
      
      // Determine nonStop: true if there's one segment or every segment shows zero stops
      const nonStop = segments.length === 1 || segments.every(seg => seg.numberOfStops === 0);
      
      // Calculate total number of stops for the itinerary (sum of each segment's stops)
      const numberOfStops = segments.reduce((acc, seg) => acc + seg.numberOfStops, 0);
      
      // Extract airline name and flight number for each segment using the carriers dictionary
      const segmentsDetails = segments.map(seg => ({
        airlineName: carriers[seg.carrierCode] || seg.carrierCode,
        flightNumber: seg.number
      }));
      
      // Push the extracted details into the array
      extractedFlights.push({
        originCode,
        arrivalCode,
        departureTime,
        arrivalTime,
        duration,
        nonStop,
        numberOfStops,
        price,
        segmentsDetails
      });
    });
  });
    
    // Output the extracted flight information
    console.log("Extracted Flight Information:", extractedFlights);
    res.json(extractedFlights);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    res.json(error);
  }
});

app.listen(8000, () => {
  console.log("Server running on http://localhost:8000 🎉 🚀");
});
