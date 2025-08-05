import { jwtVerify } from "npm:jose@5.9.6";
import { Context } from "@oak/oak";

const secretKey = new TextEncoder().encode(Deno.env.get("JWT_SECRET") || "clave_secreta");

export const authMiddleware = async (ctx: Context, next: () => Promise<unknown>) => {
  const authHeader = ctx.request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    ctx.throw(401, "No autorizado");
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const { payload } = await jwtVerify(token, secretKey);
    ctx.state.user = payload;
    await next();
  } catch (err) {
    console.error("❌ Token inválido:", err);
    ctx.throw(401, "Token inválido o expirado");
  }
};
