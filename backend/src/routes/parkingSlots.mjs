import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// Get all parking slots in a mall
router.get('/:mallId', async (req, res) => {
  const { mallId } = req.params;
  const slots = await prisma.parkingSlot.findMany({
    where: { mallId: Number(mallId) },
  });
  res.json(slots);
});

// Mark a slot as available/unavailable
router.patch('/:slotId', async (req, res) => {
  const { slotId } = req.params;
  const { isAvailable } = req.body;
  const updatedSlot = await prisma.parkingSlot.update({
    where: { id: Number(slotId) },
    data: { isAvailable },
  });
  res.json(updatedSlot);
});

export default router;
