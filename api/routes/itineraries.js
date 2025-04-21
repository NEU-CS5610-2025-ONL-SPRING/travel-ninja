// src/routes/itineraries.js
import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../index.js";

const router = express.Router();

// Create new itinerary
router.post("/", requireAuth, async (req, res) => {
  const userId = req.userId;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Itinerary name is required" });
  }

  try {
    // Using the unique constraint on [name, userId]
    const newItinerary = await prisma.itinerary.create({
      data: { name, userId },
      select: { id: true, userId: true, name: true },
    });

    res.status(201).json(newItinerary);
  } catch (error) {
    // Handle the unique constraint violation
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ error: "You already have an itinerary with this name" });
    }

    console.error("Error creating itinerary:", error);
    res.status(500).json({ error: "Failed to create itinerary" });
  }
});

// Get all itineraries for user
router.get("/", requireAuth, async (req, res) => {
  const userId = req.userId;

  try {
    const itinerariesList = await prisma.itinerary.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
    });

    res.json(itinerariesList);
  } catch (error) {
    console.error("Error fetching itineraries:", error);
    res.status(500).json({ error: "Failed to fetch itineraries" });
  }
});

// Get single itinerary by ID
router.get("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const itiId = Number(id);

  if (Number.isNaN(itiId)) {
    return res.status(400).json({ error: "Invalid itinerary id" });
  }

  try {
    const itinerary = await prisma.itinerary.findUnique({
      where: { id: itiId },
      include: {
        flights: true,
      },
    });

    if (!itinerary) {
      return res.status(404).json({ error: "Itinerary not found" });
    }

    // Verify the itinerary belongs to the requesting user
    if (itinerary.userId !== req.userId) {
      return res
        .status(403)
        .json({ error: "You don't have access to this itinerary" });
    }

    return res.json(itinerary);
  } catch (error) {
    console.error("Error fetching itinerary:", error);
    res.status(500).json({ error: "Failed to fetch itinerary" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const itiId = Number(id);

  if (Number.isNaN(itiId)) {
    return res.status(400).json({ error: "Invalid itinerary id" });
  }

  try {
    const itinerary = await prisma.itinerary.findUnique({
      where: { id: itiId },
      select: { userId: true },
    });
    if (!itinerary) {
      return res.status(404).json({ error: "Itinerary not found" });
    }
    if (itinerary.userId !== req.userId) {
      return res
        .status(403)
        .json({ error: "You don't have access to this itinerary" });
    }

    await prisma.flight.deleteMany({
      where: { itineraryId: itiId },
    });

    await prisma.itinerary.delete({
      where: { id: itiId },
    });

    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting itinerary:", error);
    return res.status(500).json({ error: "Failed to delete itinerary" });
  }
});

// PATCH single itinerary’s name
router.patch("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const itiId = Number(id);

  // Validate path param
  if (Number.isNaN(itiId)) {
    return res.status(400).json({ error: "Invalid itinerary id" });
  }

  // Validate request body
  const { name } = req.body;
  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Name must be a non-empty string" });
  }

  try {
    // Verify existence & ownership
    const existing = await prisma.itinerary.findUnique({
      where: { id: itiId },
      select: { userId: true },
    });
    if (!existing) {
      return res.status(404).json({ error: "Itinerary not found" });
    }
    if (existing.userId !== req.userId) {
      return res
        .status(403)
        .json({ error: "You don't have access to this itinerary" });
    }

    // Perform the update
    const updated = await prisma.itinerary.update({
      where: { id: itiId },
      data: { name: name.trim() },
    });

    // Return the updated record
    return res.json(updated);
  } catch (error) {
    console.error("Error updating itinerary name:", error);
    return res.status(500).json({ error: "Failed to update itinerary" });
  }
});

export default router;
