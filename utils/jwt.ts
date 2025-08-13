import { SignJWT } from "npm:jose@5.9.6";

const secretKey = new TextEncoder().encode(Deno.env.get("JWT_SECRET") || "clave_secreta");

export async function createJWT(
  payload: Record<string, unknown>,
  expiresIn: string = "1h"
): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey);
}
