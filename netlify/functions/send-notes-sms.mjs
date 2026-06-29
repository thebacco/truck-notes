const jsonHeaders = {
  "content-type": "application/json; charset=utf-8"
};

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  };
}

function normalizePhoneNumber(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (raw.startsWith("+") && digits.length >= 8 && digits.length <= 15) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return "";
}

function getTwilioConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
  const authToken = process.env.TWILIO_AUTH_TOKEN || "";
  const from = normalizePhoneNumber(process.env.TWILIO_FROM_NUMBER || "");
  return { accountSid, authToken, from };
}

async function sendTwilioMessage({ accountSid, authToken, from }, to, body) {
  const params = new URLSearchParams({ To: to, From: from, Body: body });
  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      authorization: `Basic ${credentials}`,
      "content-type": "application/x-www-form-urlencoded"
    },
    body: params.toString()
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || `Twilio request failed with ${response.status}`);
  }
  return {
    to,
    sid: payload.sid,
    status: payload.status
  };
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "POST required" });
  }

  const config = getTwilioConfig();
  if (!config.accountSid || !config.authToken || !config.from) {
    return jsonResponse(500, { error: "Twilio environment variables are not configured" });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return jsonResponse(400, { error: "Invalid JSON body" });
  }

  const body = String(payload.body || "").trim();
  const recipients = Array.isArray(payload.to)
    ? [...new Set(payload.to.map(normalizePhoneNumber).filter(Boolean))]
    : [];

  if (!body) return jsonResponse(400, { error: "Message body is required" });
  if (!recipients.length) return jsonResponse(400, { error: "At least one recipient phone number is required" });

  try {
    const messages = await Promise.all(recipients.map((to) => sendTwilioMessage(config, to, body)));
    return jsonResponse(200, { sent: messages.length, messages });
  } catch (error) {
    console.error(error);
    return jsonResponse(502, { error: "Twilio send failed" });
  }
}
