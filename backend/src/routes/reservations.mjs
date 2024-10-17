import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// Create a reservation
router.post('/', async (req, res) => {
  const { parkingSlotId, userId, startTime, endTime } = req.body;

  // Check for conflicting reservations
  const conflicts = await prisma.reservation.findMany({
    where: {
      parkingSlotId,
      OR: [
        { startTime: { lt: endTime }, endTime: { gt: startTime } },
      ],
    },
  });

  if (conflicts.length > 0) {
    return res.status(400).json({ error: 'Slot is already reserved for this time' });
  }

  const reservation = await prisma.reservation.create({
    data: { parkingSlotId, userId, startTime, endTime },
  });

  // Mark the slot as unavailable
  await prisma.parkingSlot.update({
    where: { id: parkingSlotId },
    data: { isAvailable: false },
  });

  res.status(201).json(reservation);
});

// Free parking slot
router.post('/free/:slotId', async (req, res) => {
  const { slotId } = req.params;
  const now = new Date();

  const activeReservation = await prisma.reservation.findFirst({
    where: { parkingSlotId: Number(slotId), endTime: { lt: now } },
  });

  if (activeReservation) {
    await prisma.parkingSlot.update({
      where: { id: Number(slotId) },
      data: { isAvailable: true },
    });
    return res.status(200).json({ message: 'Slot is now available' });
  }

  res.status(400).json({ error: 'No reservation to free' });
});

export default router;
