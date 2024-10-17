import express from 'express';
import { PrismaClient } from '@prisma/client';
import mallsRouter from './routes/malls.mjs';
import parkingSlotsRouter from './routes/parkingSlots.mjs';
import reservationsRouter from './routes/reservations.mjs';
import './cron.mjs';  // Import cron jobs

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use('/malls', mallsRouter);
app.use('/parking-slots', parkingSlotsRouter);
app.use('/reservations', reservationsRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
