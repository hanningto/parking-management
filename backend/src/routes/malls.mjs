import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// Get all malls
router.get('/', async (req, res) => {
  const malls = await prisma.mall.findMany();
  res.json(malls);
});

// Create a new mall
router.post('/', async (req, res) => {
  const { name, location, totalParkingSlots } = req.body;
  const newMall = await prisma.mall.create({
    data: { name, location, totalParkingSlots },
  });
  res.status(201).json(newMall);
});

export default router;
