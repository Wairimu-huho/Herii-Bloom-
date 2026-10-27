const https = require("https");

const request = (url, options, body) => new Promise((resolve, reject) => {
  const target = new URL(url);
  const req = https.request({ hostname: target.hostname, path: `${target.pathname}${target.search}`, method: options.method || "GET", headers: { ...(options.headers || {}), ...(body ? { "Content-Length": Buffer.byteLength(body) } : {}) } }, (res) => { let raw = ""; res.on("data", (chunk) => { raw += chunk; }); res.on("end", () => { let parsed; try { parsed = raw ? JSON.parse(raw) : {}; } catch { parsed = { raw }; } if (res.statusCode >= 400) return reject(new Error(parsed.errorMessage || parsed.message || `Payment provider returned ${res.statusCode}`)); resolve(parsed); }); }); req.on("error", reject); if (body) req.write(body); req.end();
});

const encodeForm = (values) => new URLSearchParams(values).toString();
const normalizePhone = (phone) => { const digits = String(phone || "").replace(/\D/g, ""); if (digits.startsWith("254")) return digits; if (digits.startsWith("0")) return `254${digits.slice(1)}`; return digits; };

async function createStripeCheckout({ order, clientUrl }) {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("Stripe is not configured. Add STRIPE_SECRET_KEY to the backend environment.");
  const params = encodeForm({ mode: "payment", success_url: `${clientUrl}/shop?payment=success&order=${order._id}`, cancel_url: `${clientUrl}/shop?payment=cancelled&order=${order._id}`, customer_email: order.user?.email || undefined, "line_items[0][price_data][currency]": "kes", "line_items[0][price_data][product_data][name]": `Heri Bloom — ${order.boxName}`, "line_items[0][price_data][unit_amount]": Math.round(order.totalPrice * 100), "line_items[0][quantity]": 1, "metadata[orderId]": String(order._id) });
  return request("https://api.stripe.com/v1/checkout/sessions", { method: "POST", headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, "Content-Type": "application/x-www-form-urlencoded" } }, params);
}

async function getMpesaToken() {
  const base = process.env.MPESA_ENV === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";
  const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString("base64");
  const result = await request(`${base}/oauth/v1/generate?grant_type=client_credentials`, { method: "GET", headers: { Authorization: `Basic ${auth}` } });
  return { base, token: result.access_token };
}

async function createMpesaStkPush({ order }) {
  if (!process.env.MPESA_CONSUMER_KEY || !process.env.MPESA_CONSUMER_SECRET || !process.env.MPESA_SHORTCODE || !process.env.MPESA_PASSKEY || !process.env.MPESA_CALLBACK_URL) throw new Error("M-Pesa is not configured. Add the Daraja credentials and callback URL to the backend environment.");
  const { base, token } = await getMpesaToken();
  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString("base64");
  return request(`${base}/mpesa/stkpush/v1/processrequest`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }, JSON.stringify({ BusinessShortCode: process.env.MPESA_SHORTCODE, Password: password, Timestamp: timestamp, TransactionType: process.env.MPESA_TRANSACTION_TYPE || "CustomerPayBillOnline", Amount: Math.max(1, Math.round(order.totalPrice)), PartyA: normalizePhone(order.phone), PartyB: process.env.MPESA_SHORTCODE, PhoneNumber: normalizePhone(order.phone), CallBackURL: process.env.MPESA_CALLBACK_URL, AccountReference: `HB-${String(order._id).slice(-8)}`, TransactionDesc: `Heri Bloom order ${order._id}` }));
}

module.exports = { createStripeCheckout, createMpesaStkPush, normalizePhone };
