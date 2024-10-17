import cron from 'node-cron';
import { freeExpiredReservations } from './jobs/scheduledJobs.mjs';

// Run the job every minute to check for expired reservations
cron.schedule('* * * * *', () => {
  console.log('Running scheduled job to free expired parking slots...');
  freeExpiredReservations();
});
