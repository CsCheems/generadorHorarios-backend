
import { verify } from "https://deno.land/x/djwt/mod.ts";
import { Context } from "@oak/oak";

const JWT_SECRET = Deno.env.get("SECRET_CLV"); 

export const authMiddleware = async (ctx: Context, next: () => Promise<unknown>) => {
  const authHeader = ctx.request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    ctx.throw(401, "No autorizado");
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const payload = await verify(token, JWT_SECRET, "HS256");
    ctx.state.user = payload;
    await next();
  } catch (err) {
    console.error("❌ Token inválido:", err);
    ctx.throw(401, "Token inválido o expirado");
  }
};
