import {
  getRequestOrigin,
  isEmailAllowed,
  jsonResponse,
  normalizeEmail,
  signPayload
} from "./auth-utils.mjs";

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendMagicLinkEmail(email, link) {
  const apiKey = process.env.RESEND_API_KEY || "";
  if (!apiKey) throw new Error("RESEND_API_KEY is required");

  const from = process.env.RESEND_FROM_EMAIL || process.env.AUTH_FROM_EMAIL || "Truck Notes <truck-notes@theblindrhino.com>";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Sign in to Truck Notes",
      text: `Sign in to Truck Notes:\n\n${link}\n\nThis link expires in 15 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.45; color: #161616;">
          <h1 style="margin: 0 0 12px;">Truck Notes</h1>
          <p>Use this link to sign in. It expires in 15 minutes.</p>
          <p><a href="${escapeHtml(link)}" style="display: inline-block; padding: 12px 16px; background: #b8843f; color: #161616; text-decoration: none; border-radius: 6px; font-weight: 700;">Sign in</a></p>
          <p style="font-size: 13px; color: #6b6760;">If you did not request this, ignore this email.</p>
        </div>
      `
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || `Resend request failed with ${response.status}`);
  return payload;
}

function cleanDisplayName(value = "") {
  return String(value || "").trim().replace(/\s+/g, " ");
}

export async function handler(event) {
  if (event.httpMethod !== "POST") return jsonResponse(405, { error: "POST required" });

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return jsonResponse(400, { error: "Invalid JSON body" });
  }

  const email = normalizeEmail(payload.email);
  const name = cleanDisplayName(payload.name);
  if (!name) return jsonResponse(400, { error: "Name is required" });
  if (!email.includes("@")) return jsonResponse(400, { error: "Valid email is required" });
  if (!isEmailAllowed(email)) return jsonResponse(403, { error: "Email is not allowed" });

  try {
    const token = signPayload({
      type: "magic",
      email,
      name,
      exp: Date.now() + 15 * 60 * 1000
    });
    const origin = getRequestOrigin(event).replace(/\/$/, "");
    const link = `${origin}/?magic_token=${encodeURIComponent(token)}`;
    await sendMagicLinkEmail(email, link);
    return jsonResponse(200, { ok: true });
  } catch (error) {
    console.error(error);
    return jsonResponse(500, { error: "Could not send magic link" });
  }
}
