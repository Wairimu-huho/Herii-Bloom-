const https = require("https");

const request = (url, options = {}, body) => new Promise((resolve, reject) => {
  const target = new URL(url);
  const payload = body ? JSON.stringify(body) : null;
  const req = https.request({ hostname: target.hostname, path: `${target.pathname}${target.search}`, method: options.method || "GET", headers: { Accept: "application/json", ...(payload ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) } : {}), ...(options.headers || {}) } }, (res) => {
    let raw = "";
    res.on("data", (chunk) => { raw += chunk; });
    res.on("end", () => {
      let parsed;
      try { parsed = raw ? JSON.parse(raw) : {}; } catch { parsed = { raw }; }
      if (res.statusCode >= 400 || parsed.status === false) return reject(new Error(parsed.message || parsed.error || `Paystack returned ${res.statusCode}`));
      resolve(parsed);
    });
  });
  req.on("error", reject);
  if (payload) req.write(payload);
  req.end();
});

const secretKey = () => {
  if (!process.env.PAYSTACK_SECRET_KEY) throw new Error("Paystack is not configured. Add PAYSTACK_SECRET_KEY to the backend environment.");
  return process.env.PAYSTACK_SECRET_KEY;
};

const paystackRequest = (path, options = {}, body) => request(`https://api.paystack.co${path}`, { ...options, headers: { Authorization: `Bearer ${secretKey()}`, ...(options.headers || {}) } }, body);

async function initializePaystackTransaction({ order, clientUrl }) {
  const reference = `HB-${String(order._id)}-${Date.now()}`;
  const currency = process.env.PAYSTACK_CURRENCY || "KES";
  const result = await paystackRequest("/transaction/initialize", { method: "POST" }, {
    email: order.user?.email,
    amount: Math.round(Number(order.totalPrice) * 100),
    currency,
    reference,
    callback_url: `${clientUrl}/shop?payment=paystack&order=${order._id}`,
    channels: (process.env.PAYSTACK_CHANNELS || "card,mobile_money,bank_transfer,ussd,qr").split(",").map((item) => item.trim()).filter(Boolean),
    metadata: JSON.stringify({ orderId: String(order._id), orderName: order.boxName }),
  });
  if (!result.data?.authorization_url || !result.data?.reference) throw new Error("Paystack did not return a checkout URL");
  return result.data;
}

async function verifyPaystackTransaction(reference) {
  if (!reference) throw new Error("Paystack transaction reference is required");
  return paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`);
}

module.exports = { initializePaystackTransaction, verifyPaystackTransaction };
