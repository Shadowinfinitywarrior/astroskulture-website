import AbandonedCart from '../models/AbandonedCart.js';
import { sendAbandonedCartNotification } from './notificationService.js';

let isRunning = false;

export const processAbandonedCarts = async () => {
  if (isRunning) return;
  isRunning = true;

  try {
    const now = new Date();

    // 1. Process 1st reminders (scheduled for 30 minutes after abandonment)
    const pendingFirstReminders = await AbandonedCart.find({
      status: 'abandoned',
      firstNotificationSentAt: null,
      firstNotificationScheduledAt: { $lte: now },
    }).limit(50);

    for (const cart of pendingFirstReminders) {
      try {
        await sendAbandonedCartNotification({
          type: 'first_reminder',
          cart,
        });

        cart.firstNotificationSentAt = now;
        cart.status = 'first_reminder_sent';
        await cart.save();
      } catch (err) {
        console.error(`[AbandonedCart] Error sending 1st reminder for ${cart._id}:`, err.message);
      }
    }

    // 2. Process 2nd reminders (scheduled for 24 hours after abandonment)
    // Only send if the customer hasn't already recovered, completed, or opened and taken action
    const pendingSecondReminders = await AbandonedCart.find({
      status: 'first_reminder_sent',
      customerOpenedAt: null, // User did not open/action the first reminder
      secondNotificationSentAt: null,
      secondNotificationScheduledAt: { $lte: now },
    }).limit(50);

    for (const cart of pendingSecondReminders) {
      try {
        await sendAbandonedCartNotification({
          type: 'second_reminder',
          cart,
        });

        cart.secondNotificationSentAt = now;
        cart.status = 'second_reminder_sent';
        await cart.save();
      } catch (err) {
        console.error(`[AbandonedCart] Error sending 2nd reminder for ${cart._id}:`, err.message);
      }
    }
  } catch (err) {
    console.error('[AbandonedCart Scheduler Error]', err.message);
  } finally {
    isRunning = false;
  }
};

/**
 * Start background recovery worker running every 5 minutes
 */
export const startAbandonedCartWorker = () => {
  console.log('⏰ Abandoned Cart Recovery Worker initialized (30m & 24h reminders active)');
  // Initial check after 30 seconds
  setTimeout(processAbandonedCarts, 30 * 1000);
  // Interval check every 5 minutes
  setInterval(processAbandonedCarts, 5 * 60 * 1000);
};
