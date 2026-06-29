import { createHmac, timingSafeEqual } from "node:crypto";

const encoder = new TextEncoder();

export function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload)
  };
}

export function normalizeEmail(value = "") {
  return String(value || "").trim().toLowerCase();
}

export function getRequestOrigin(event) {
  const headers = event.headers || {};
  return headers.origin || headers.Origin || process.env.URL || process.env.DEPLOY_PRIME_URL || "http://localhost:8010";
}

export function authSecret() {
  return process.env.AUTH_SECRET || process.env.RESEND_API_KEY || "";
}

export function base64UrlEncode(value) {
  const input = typeof value === "string" ? value : JSON.stringify(value);
  return Buffer.from(input).toString("base64url");
}

export function base64UrlDecode(value) {
  return Buffer.from(String(value || ""), "base64url").toString("utf8");
}

export function signPayload(payload) {
  const secret = authSecret();
  if (!secret) throw new Error("AUTH_SECRET or RESEND_API_KEY is required");
  const encodedPayload = base64UrlEncode(payload);
  const signature = createHmac("sha256", secret).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

export function verifyToken(token, expectedType) {
  const secret = authSecret();
  if (!secret) throw new Error("AUTH_SECRET or RESEND_API_KEY is required");
  const [encodedPayload, signature] = String(token || "").split(".");
  if (!encodedPayload || !signature) return null;
  const expectedSignature = createHmac("sha256", secret).update(encodedPayload).digest("base64url");
  const signatureBytes = encoder.encode(signature);
  const expectedBytes = encoder.encode(expectedSignature);
  if (signatureBytes.length !== expectedBytes.length || !timingSafeEqual(signatureBytes, expectedBytes)) return null;
  const payload = JSON.parse(base64UrlDecode(encodedPayload));
  if (expectedType && payload.type !== expectedType) return null;
  if (!payload.exp || Number(payload.exp) <= Date.now()) return null;
  return payload;
}

export function allowedEmails() {
  return String(process.env.AUTH_ALLOWED_EMAILS || "")
    .split(",")
    .map(normalizeEmail)
    .filter(Boolean);
}

export function isEmailAllowed(email) {
  const allowed = allowedEmails();
  return !allowed.length || allowed.includes(normalizeEmail(email));
}
