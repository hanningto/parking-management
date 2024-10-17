import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const freeExpiredReservations = async () => {
  const now = new Date();

  try {
    // Find expired reservations and free up slots
    const expiredReservations = await prisma.reservation.findMany({
      where: {
        endTime: {
          lt: now,
        },
      },
    });

    for (const reservation of expiredReservations) {
      await prisma.parkingSlot.update({
        where: { id: reservation.parkingSlotId },
        data: { isAvailable: true },
      });

      console.log(`Freed up parking slot: ${reservation.parkingSlotId}`);
    }
  } catch (error) {
    console.error('Error freeing expired reservations:', error);
  }
};
