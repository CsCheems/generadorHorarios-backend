import { Application } from "@oak/oak";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { ruta } from "./routes/authRoutes.ts";
import "https://deno.land/std@0.224.0/dotenv/load.ts";

const app = new Application();
const port = 8080;

app.use(oakCors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(ruta.routes());
app.use(ruta.allowedMethods());

console.log(`Servidor iniciado en el puerto: ${port}`);
await app.listen({ port });

