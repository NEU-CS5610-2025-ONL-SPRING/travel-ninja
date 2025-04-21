import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client";

import authRoutes from "./routes/auth.js";
import flightRoutes from "./routes/flights.js";
import itineraryRoutes from "./routes/itineraries.js";

const app = express();
export const prisma = new PrismaClient();

// app.use(
//   cors({
//     origin: "https://frontend-4fcrqfdux-shreyas-sahus-projects.vercel.app",
//     credentials: true,
//   })
// );

// Replace your current CORS setup with this:
const allowedOrigins = [
  "https://frontend-4fcrqfdux-shreyas-sahus-projects.vercel.app",
  // Add any other origins you need to support, such as localhost for development
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error("CORS policy violation"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

app.use("/", authRoutes);
app.use("/flights", flightRoutes);
app.use("/itinerary", itineraryRoutes);

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} 🎉 🚀`);
});
