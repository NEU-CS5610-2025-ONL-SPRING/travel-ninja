import express from "express";
import { amadeus } from "../config/amadeus.js";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../index.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      departureDate,
      returnDate,
      originLocationCode,
      destinationLocationCode,
      adults,
      children,
      infants,
      travelClass,
      nonStop,
      maxPrice,
      currencyCode,
      includedAirlineCodes,
      excludedAirlineCodes,
      max,
    } = req.body;

    const response = await amadeus.shopping.flightOffersSearch
      .get({
        originLocationCode,
        destinationLocationCode,
        departureDate,
        returnDate,
        max: max || 10,
        adults: adults || 1,
        children,
        infants,
        travelClass,
        nonStop,
        maxPrice,
        currencyCode,
        includedAirlineCodes,
        excludedAirlineCodes,
      })
      .catch((err) => {
        console.error("Amadeus API error:", err);
        throw new Error("Failed to fetch flight offers");
      });

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

    res.json(extractedFlights);
  } catch (error) {
    console.error("Error processing flight search:", error);
    res.status(500).json({ error: "Failed to search flights" });
  }
});

router.post("/addFlight/:itId", requireAuth, async (req, res) => {
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
    const itinerary = await prisma.itinerary.findUnique({
      where: { id: itineraryId },
    });

    if (!itinerary) {
      return res.status(404).json({ error: "Itinerary not found" });
    }

    if (itinerary.userId !== req.userId) {
      return res
        .status(403)
        .json({ error: "You don't have access to this itinerary" });
    }

    const flight = await prisma.flight.create({
      data: {
        flightName: seg.flightNumber,
        airlineName: seg.airlineName,
        source: outbound.originCode,
        destination: outbound.arrivalCode,
        departureDate: new Date(outbound.departureTime),
        returnDate: new Date(outbound.arrivalTime),
        price: parseFloat(outbound.price.total),
        itinerary: { connect: { id: itineraryId } },
      },
    });

    return res.json(flight);
  } catch (err) {
    console.error("Error creating flight:", err);
    return res.status(500).json({ error: "Unable to add flight to itinerary" });
  }
});

export default router;
