const nodemailer = require("nodemailer");
const User = require("../models/User");

let transporter;
function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: String(process.env.SMTP_SECURE || "false") === "true", auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
  return transporter;
}

const money = (value) => `KSh ${Number(value || 0).toLocaleString()}`;
const baseUrl = () => String(process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
const fromAddress = () => process.env.EMAIL_FROM || `Heri Bloom <${process.env.SMTP_USER || "hello@heribloom.com"}>`;

async function recipientFor(order) {
  if (order.notificationPreferences?.email === false) return null;
  const user = order.user?.email ? order.user : await User.findById(order.user).select("name email").lean();
  if (!user?.email) return null;
  return user;
}

async function sendEmail({ to, subject, html }) {
  const mailer = getTransporter();
  if (!mailer) { console.warn("Email not sent: configure SMTP_HOST, SMTP_USER, and SMTP_PASS"); return false; }
  await mailer.sendMail({ from: fromAddress(), to, subject, html });
  return true;
}

async function sendOrderConfirmationEmail(order) {
  const user = await recipientFor(order);
  if (!user) return false;
  const trackingUrl = `${baseUrl()}/orders`;
  const deliveries = (order.deliveries || []).map((delivery) => `<tr><td style="padding:10px 0;border-bottom:1px solid #f0dce5">Delivery ${delivery.sequence}</td><td style="padding:10px 0;border-bottom:1px solid #f0dce5;text-align:right">${new Date(delivery.scheduledDate).toLocaleDateString()} · Confirmed</td></tr>`).join("");
  return sendEmail({ to: user.email, subject: `Heri Bloom order ${order.orderNumber} confirmed`, html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#4b0d32;background:#fffaf7;padding:32px"><p style="letter-spacing:3px;color:#c2185b;font-size:12px">HERI BLOOM</p><h1 style="font-family:Georgia,serif;font-size:34px">Your order is confirmed</h1><p>Hi ${user.name || "there"}, thank you for choosing Heri Bloom. Your Paystack payment was received successfully.</p><div style="background:#f8e8ef;border-radius:16px;padding:20px;margin:24px 0"><p style="margin:0;color:#c2185b;font-size:12px;letter-spacing:2px">ORDER NUMBER</p><strong style="font-size:24px">${order.orderNumber}</strong><p style="margin-bottom:0">${order.boxName} · ${money(order.totalPrice)}</p></div><h2 style="font-family:Georgia,serif">Delivery schedule</h2><table style="width:100%;border-collapse:collapse">${deliveries}</table><a href="${trackingUrl}" style="display:inline-block;background:#c2185b;color:white;text-decoration:none;padding:13px 22px;border-radius:999px;margin-top:24px">View order tracking</a><p style="font-size:12px;color:#806779;margin-top:28px">Payment reference: ${order.paymentReference || "—"}</p></div>` });
}

async function sendDeliveryDeliveredEmail(order, delivery, token) {
  const user = await recipientFor(order);
  if (!user) return false;
  const deliveryUrl = token ? `${baseUrl()}/delivery/${token}` : `${baseUrl()}/orders`;
  return sendEmail({ to: user.email, subject: `Heri Bloom delivery ${order.orderNumber} has arrived`, html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#4b0d32;background:#fffaf7;padding:32px"><p style="letter-spacing:3px;color:#c2185b;font-size:12px">HERI BLOOM</p><h1 style="font-family:Georgia,serif;font-size:34px">Your delivery has arrived</h1><p>Hi ${user.name || "there"}, delivery ${delivery.sequence || 1} for order <strong>${order.orderNumber}</strong> has been marked as delivered.</p><div style="background:#f8e8ef;border-radius:16px;padding:20px;margin:24px 0"><p style="margin:0"><strong>${order.boxName}</strong></p><p style="margin-bottom:0">Delivered on ${new Date(delivery.deliveredAt || Date.now()).toLocaleDateString()}</p></div><p>Please use the secure link below to confirm that everything arrived safely or report a problem within 48–72 hours.</p><a href="${deliveryUrl}" style="display:inline-block;background:#c2185b;color:white;text-decoration:none;padding:13px 22px;border-radius:999px;margin-top:10px">Confirm delivery</a><p style="font-size:12px;color:#806779;margin-top:28px">You can also view your full order at <a href="${baseUrl()}/orders">${baseUrl()}/orders</a>.</p></div>` });
}

module.exports = { sendOrderConfirmationEmail, sendDeliveryDeliveredEmail };
