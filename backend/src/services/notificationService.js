import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT) || 587;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  return transporter;
};

export const sendAbandonedCartNotification = async ({
  type, // 'first_reminder' (30m) | 'second_reminder' (24h)
  cart,
}) => {
  const customerName = cart.customer?.name || 'there';
  const customerEmail = cart.customer?.email;
  const customerPhone = cart.customer?.phone;
  const recoveryUrl = cart.recoveryUrl || `https://astroskulture.in/cart`;
  const itemsText = (cart.items || []).map((i) => `${i.name} (Size: ${i.size || 'M'})`).join(', ');

  const isFirst = type === 'first_reminder';
  const subject = isFirst
    ? `Did you leave something behind at Astros Kulture?`
    : `Final reminder: Your reserved items are waiting + 10% OFF!`;

  const discountMsg = isFirst
    ? `Your curated pieces are reserved in your cart, but stock is limited.`
    : `We have reserved your pieces for 24 hours. Use promo code <strong>ASTROS10</strong> at checkout for 10% OFF!`;

  console.log(`\n🔔 [ABANDONED CART NOTIFICATION - ${type.toUpperCase()}]`);
  console.log(`   Customer: ${customerName} | Phone: ${customerPhone || 'N/A'} | Email: ${customerEmail || 'N/A'}`);
  console.log(`   Items: ${itemsText}`);
  console.log(`   Recovery URL: ${recoveryUrl}`);

  // Send Email if email is available and SMTP is configured
  if (customerEmail) {
    try {
      const mailer = getTransporter();
      if (mailer) {
        await mailer.sendMail({
          from: `"Astros Kulture" <${process.env.SMTP_FROM || 'support@astroskulture.in'}>`,
          to: customerEmail,
          subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
              <h2 style="color: #dc2626; text-transform: uppercase;">Astros Kulture</h2>
              <p>Hey ${customerName},</p>
              <p>${discountMsg}</p>
              <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0; font-weight: bold;">Items in your cart:</p>
                <p style="margin: 5px 0 0 0; color: #555;">${itemsText}</p>
                <p style="margin: 10px 0 0 0; font-weight: bold; color: #dc2626;">Total: ₹${cart.cartTotal || 0}</p>
              </div>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${recoveryUrl}" style="background: #dc2626; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
                  Complete Your Order Now &rarr;
                </a>
              </p>
              <p style="font-size: 12px; color: #888;">If you already completed this order, you can safely ignore this message.</p>
            </div>
          `,
        });
        console.log(`   ✓ Reminder email successfully sent to: ${customerEmail}`);
      }
    } catch (err) {
      console.error(`   ✗ Email dispatch failed:`, err.message);
    }
  }

  return true;
};
