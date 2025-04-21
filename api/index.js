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

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
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
