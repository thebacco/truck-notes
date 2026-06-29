import {
  jsonResponse,
  signPayload,
  verifyToken
} from "./auth-utils.mjs";

export async function handler(event) {
  if (event.httpMethod !== "POST") return jsonResponse(405, { error: "POST required" });

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return jsonResponse(400, { error: "Invalid JSON body" });
  }

  try {
    const magicPayload = verifyToken(payload.token, "magic");
    if (!magicPayload?.email) return jsonResponse(401, { error: "Invalid or expired sign-in link" });

    const sessionToken = signPayload({
      type: "session",
      email: magicPayload.email,
      name: magicPayload.name
    });

    return jsonResponse(200, {
      session: {
        email: magicPayload.email,
        name: magicPayload.name,
        token: sessionToken
      }
    });
  } catch (error) {
    console.error(error);
    return jsonResponse(401, { error: "Invalid or expired sign-in link" });
  }
}
