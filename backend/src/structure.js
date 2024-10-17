// // To rewrite the backend using ECMAScript modules (.mjs) and implement scheduled jobs for managing parking slots, we'll use mjs syntax throughout the project and add a scheduled job with node-cron to automatically free up parking slots when their reservation time has passed.

// // Backend Architecture Overview with .mjs
// // Node.js: Handles server-side logic using ECMAScript modules.
// // Express.js: Manages API routes.
// // Prisma ORM: Connects to MySQL for database operations.
// // Scheduled Jobs: Uses node-cron to periodically free up expired reservations.
// // RESTful API: Provides endpoints to interact with malls, slots, and reservations.
// // Steps to Implement
// // 1. Install Dependencies
// // bash
// // Copy code
// // npm init -y
// // npm install express prisma @prisma/client mysql2 dotenv node-cron
// // express: For routing and managing the web server.
// // prisma: Prisma ORM for database interaction.
// // @prisma/client: Client library for Prisma.
// // mysql2: MySQL driver.
// // dotenv: For managing environment variables.
// // node-cron: To implement scheduled jobs.
// // 2. Prisma Setup
// // Initialize Prisma (if not done yet).

// // bash
// // Copy code
// // npx prisma init
// // Set up your prisma/schema.prisma file (as done previously):

// // prisma
// // Copy code
// // model Mall {
// //   id               Int            @id @default(autoincrement())
// //   name             String
// //   location         String?
// //   totalParkingSlots Int
// //   parkingSlots     ParkingSlot[]
// //   createdAt        DateTime        @default(now())
// // }

// // model ParkingSlot {
// //   id          Int          @id @default(autoincrement())
// //   mall        Mall         @relation(fields: [mallId], references: [id])
// //   mallId      Int
// //   slotNumber  String
// //   isAvailable Boolean      @default(true)
// //   reservations Reservation[]
// //   createdAt   DateTime      @default(now())
// // }

// // model Reservation {
// //   id           Int      @id @default(autoincrement())
// //   parkingSlot  ParkingSlot @relation(fields: [parkingSlotId], references: [id])
// //   parkingSlotId Int
// //   userId       Int?
// //   startTime    DateTime
// //   endTime      DateTime
// //   createdAt    DateTime @default(now())
// // }

// // model User {
// //   id         Int        @id @default(autoincrement())
// //   name       String
// //   email      String     @unique
// //   phone      String?
// //   reservations Reservation[]
// //   createdAt  DateTime   @default(now())
// // }
// // Generate the Prisma client:

// // bash
// // Copy code
// // npx prisma migrate dev --name init
// // npx prisma generate
// // 3. Setup .mjs Structure
// // Create your folder and file structure as follows:

// // bash
// // Copy code
// // /src
// //   /routes
// //     malls.mjs
// //     parkingSlots.mjs
// //     reservations.mjs
// //   /jobs
// //     scheduledJobs.mjs
// //   index.mjs
// //   cron.mjs
// // 4. Scheduled Jobs Setup
// // Create a file src/jobs/scheduledJobs.mjs to handle freeing up expired parking slots:

// // javascript
// // Copy code
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

// export const freeExpiredReservations = async () => {
//   const now = new Date();

//   try {
//     // Find expired reservations and free up slots
//     const expiredReservations = await prisma.reservation.findMany({
//       where: {
//         endTime: {
//           lt: now,
//         },
//       },
//     });

//     for (const reservation of expiredReservations) {
//       await prisma.parkingSlot.update({
//         where: { id: reservation.parkingSlotId },
//         data: { isAvailable: true },
//       });

//       console.log(`Freed up parking slot: ${reservation.parkingSlotId}`);
//     }
//   } catch (error) {
//     console.error('Error freeing expired reservations:', error);
//   }
// };
// // 5. Set Up node-cron to Run Jobs
// // Create a src/cron.mjs file that uses node-cron to schedule the job:

// javascript
// Copy code
// import cron from 'node-cron';
// import { freeExpiredReservations } from './jobs/scheduledJobs.mjs';

// // Run the job every minute to check for expired reservations
// cron.schedule('* * * * *', () => {
//   console.log('Running scheduled job to free expired parking slots...');
//   freeExpiredReservations();
// });
// // 6. Express Server Setup
// // Create src/index.mjs to set up the Express server and routes.

// javascript
// Copy code
// import express from 'express';
// import { PrismaClient } from '@prisma/client';
// import mallsRouter from './routes/malls.mjs';
// import parkingSlotsRouter from './routes/parkingSlots.mjs';
// import reservationsRouter from './routes/reservations.mjs';
// import './cron.mjs';  // Import cron jobs

// const app = express();
// const prisma = new PrismaClient();

// const PORT = process.env.PORT || 3000;

// app.use(express.json());

// // Routes
// app.use('/malls', mallsRouter);
// app.use('/parking-slots', parkingSlotsRouter);
// app.use('/reservations', reservationsRouter);

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
// // 7. API Routes in .mjs Format
// // src/routes/malls.mjs:
// // javascript
// // Copy code
// import express from 'express';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();
// const router = express.Router();

// // Get all malls
// router.get('/', async (req, res) => {
//   const malls = await prisma.mall.findMany();
//   res.json(malls);
// });

// // Create a new mall
// router.post('/', async (req, res) => {
//   const { name, location, totalParkingSlots } = req.body;
//   const newMall = await prisma.mall.create({
//     data: { name, location, totalParkingSlots },
//   });
//   res.status(201).json(newMall);
// });

// export default router;
// src/routes/parkingSlots.mjs:
// javascript
// Copy code
// import express from 'express';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();
// const router = express.Router();

// // Get all parking slots in a mall
// router.get('/:mallId', async (req, res) => {
//   const { mallId } = req.params;
//   const slots = await prisma.parkingSlot.findMany({
//     where: { mallId: Number(mallId) },
//   });
//   res.json(slots);
// });

// // Mark a slot as available/unavailable
// router.patch('/:slotId', async (req, res) => {
//   const { slotId } = req.params;
//   const { isAvailable } = req.body;
//   const updatedSlot = await prisma.parkingSlot.update({
//     where: { id: Number(slotId) },
//     data: { isAvailable },
//   });
//   res.json(updatedSlot);
// });

// export default router;
// // src/routes/reservations.mjs:
// // javascript
// // Copy code
// import express from 'express';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();
// const router = express.Router();

// // Create a reservation
// router.post('/', async (req, res) => {
//   const { parkingSlotId, userId, startTime, endTime } = req.body;

//   // Check for conflicting reservations
//   const conflicts = await prisma.reservation.findMany({
//     where: {
//       parkingSlotId,
//       OR: [
//         { startTime: { lt: endTime }, endTime: { gt: startTime } },
//       ],
//     },
//   });

//   if (conflicts.length > 0) {
//     return res.status(400).json({ error: 'Slot is already reserved for this time' });
//   }

//   const reservation = await prisma.reservation.create({
//     data: { parkingSlotId, userId, startTime, endTime },
//   });

//   // Mark the slot as unavailable
//   await prisma.parkingSlot.update({
//     where: { id: parkingSlotId },
//     data: { isAvailable: false },
//   });

//   res.status(201).json(reservation);
// });

// // Free parking slot
// router.post('/free/:slotId', async (req, res) => {
//   const { slotId } = req.params;
//   const now = new Date();

//   const activeReservation = await prisma.reservation.findFirst({
//     where: { parkingSlotId: Number(slotId), endTime: { lt: now } },
//   });

//   if (activeReservation) {
//     await prisma.parkingSlot.update({
//       where: { id: Number(slotId) },
//       data: { isAvailable: true },
//     });
//     return res.status(200).json({ message: 'Slot is now available' });
//   }

//   res.status(400).json({ error: 'No reservation to free' });
// });

// // export default router;
// // 8. Running the Application
// // Start the Prisma client:

// // bash
// // Copy code
// // npx prisma migrate dev
// // Start the Node.js application:

// // bash
// // Copy code
// // node --experimental-modules src/index.mjs
// // This architecture uses modern ECMAScript modules and implements scheduled jobs that run every minute to automatically free expired reservations.