const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;

const rateStore = {};
const RATE_LIMIT  = 15;
const RATE_WINDOW = 60 * 1000;

function isRateLimited(ip) {
  const now   = Date.now();
  const entry = rateStore[ip];
  if (!entry || now - entry.start > RATE_WINDOW) {
    rateStore[ip] = { count: 1, start: now };
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

function reply(status, body) {
  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    },
    body: JSON.stringify(body),
  };
}

exports.handler = async function (event) {

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin":  ALLOWED_ORIGIN,
        "Access-Control-Allow-Headers": "Content-Type, x-chat-token",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") return reply(405, { error: "Method not allowed" });

  const origin = event.headers["origin"] || "";
  if (origin !== ALLOWED_ORIGIN) return reply(403, { error: "Forbidden" });

  const token = event.headers["x-chat-token"] || "";
  if (token !== process.env.CHAT_SECRET) return reply(401, { error: "Unauthorized" });

  const ip = event.headers["x-forwarded-for"]?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) return reply(429, { error: "Too many requests. Gemini free tier is 15 req/min." });

  let body;
  try { body = JSON.parse(event.body); }
  catch { return reply(400, { error: "Invalid JSON" }); }

  const { prompt } = body;
  if (!prompt || typeof prompt !== "string") return reply(400, { error: "Missing prompt" });

  const safePropmt = prompt.slice(0, 8000);

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: safePropmt }] }],
        generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
      }),
    }
  );

  const data = await geminiRes.json();

  if (!geminiRes.ok) return reply(geminiRes.status, { error: data?.error?.message || "Gemini error" });

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return reply(200, { result: text });
};