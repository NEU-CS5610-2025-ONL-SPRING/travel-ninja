import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import pkg from "@prisma/client";
import morgan from "morgan";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import { amadeus } from "./amadeusAuth.js";

const app = express();

// Fix CORS configuration to match your frontend port
app.use(cors({ 
  origin: "http://localhost:3000", // Make sure this matches your frontend URL exactly
  credentials: true 
}));

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
    req.userId = payload.userId;
    next();
  } catch (err) {
    console.error("JWT verification error:", err);
    return res.status(401).json({ error: "Unauthorized" });
  }
}

// Public endpoint
app.get("/ping", (req, res) => {
  res.send("pong");
});

// Registration endpoint - Fixed error handling
app.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password, and name are required" });
    }
    
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
    
    // Fix cookie settings for proper cross-domain functionality
    res.cookie("token", token, { 
      httpOnly: true, 
      maxAge: 15 * 60 * 1000,
      sameSite: 'strict', // Use 'None' with secure:true in production with HTTPS
      // secure: true, // Uncomment in production with HTTPS
      path: '/'
    });

    console.log("User registered successfully:", { id: newUser.id, email: newUser.email });
    res.json(newUser);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

// Login endpoint - Fixed error handling
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    
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
    
    // Fix cookie settings for proper cross-domain functionality
    res.cookie("token", token, { 
      httpOnly: true, 
      maxAge: 15 * 60 * 1000,
      sameSite: 'strict', // Use 'None' with secure:true in production with HTTPS
      // secure: true, // Uncomment in production with HTTPS
      path: '/'
    });

    // Ensure that the password is not sent to the client
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    console.log("User logged in successfully:", { id: user.id, email: user.email });
    res.json(userData);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// Rest of your code remains the same
app.post("/logout", async (req, res) => {
  res.clearCookie("token", { path: '/' });
  res.json({ message: "Logged out" });
});

app.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true },
    });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
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
  const existingItinerary = await prisma.itinerary.findFirst({
    where: { userId: userId, name: name },
  });
  if (existingItinerary) {
    return res.status(400).json({ error: "Itinerary already exists" });
  }
  const newItinerary = await prisma.itinerary.create({
    data: { name, userId },
    select: { userId: true, name: true },
  });
  res.json(newItinerary);
});

app.get("/itinerary", requireAuth, async (req, res) => {
  const userId = req.userId;
  const itinerariesList = await prisma.itinerary.findMany({
    where: { userId: userId },
  });
  res.json(itinerariesList);
});

app.get("/itinerary/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const itiId = Number(id);
  if (Number.isNaN(itiId)) {
    return res.status(400).json({ error: "Invalid itinerary id" });
  }
  const itinerary = await prisma.itinerary.findUnique({
    where: { id: itiId },
    include: {
      flights: true,
    },
  });

  if (!itinerary) {
    return res.status(404).json({ error: "Itinerary not found" });
  }

  return res.json(itinerary);
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

    // console.log("Extracted Flight Information:", extractedFlights);
    res.json(extractedFlights);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    res.json(error);
  }
});

app.post("/addFlight/:itId", requireAuth, async (req, res) => {
  const itineraryId = parseInt(req.params.itId, 10);
  if (Number.isNaN(itineraryId)) {
    return res.status(400).json({ error: "Invalid itinerary id" });
  }

  const { outbound } = req.body;
  const seg = outbound?.segmentsDetails?.[0];
  if (!seg) {
    return res.status(400).json({ error: "Missing flight segment details" });
  }

  try {
    // 3) create the Flight, *only* connecting the itinerary:
    const flight = await prisma.flight.create({
      data: {
        flightName: seg.flightNumber,
        airlineName: seg.airlineName,
        source: outbound.originCode,
        destination: outbound.arrivalCode,
        departureDate: new Date(outbound.departureTime),
        returnDate: new Date(outbound.arrivalTime),
        price: parseFloat(outbound.price.total),

        // ← connect to the itinerary
        itinerary: { connect: { id: itineraryId } },
      },
    });

    return res.json(flight);
  } catch (err) {
    console.error("Error creating flight:", err);
    return res.status(500).json({ error: "Unable to add flight to itinerary" });
  }
});

app.listen(8000, () => {
  console.log("Server running on http://localhost:8000 🎉 🚀");
});