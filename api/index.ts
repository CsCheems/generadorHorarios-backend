import { Application } from "@oak/oak";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { ruta } from "../routes/authRoutes.ts";

const app = new Application();

app.use(oakCors({
  origin: [
    "http://localhost:5173", 
    "https://generador-horarios-five.vercel.app"
  ],
  credentials: true,
}));

app.use(ruta.routes());
app.use(ruta.allowedMethods());

export default async (req: Request) => {
  try {
    const response = await app.handle(req);
    return response || new Response("Not Found", { status: 404 });
  } catch (error) {
    console.error("Error handling request:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};