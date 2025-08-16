import { Application } from "@oak/oak";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { ruta } from "./routes/authRoutes.ts";
import "https://deno.land/std@0.224.0/dotenv/load.ts";

const app = new Application();
const port = parseInt(Deno.env.get("PORT") ?? "8080", 10);

// Obtenemos lista de orígenes permitidos desde la env var
const allowedOrigins = (Deno.env.get("CORS_ORIGINS") ?? "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  oakCors({
    origin: (requestOrigin) => {
      if (!requestOrigin) return false;
      return allowedOrigins.includes(requestOrigin) ? requestOrigin : false;
    },
    credentials: true,
  }),
);

app.use(ruta.routes());
app.use(ruta.allowedMethods());

console.log(`Servidor iniciado en el puerto: ${port}`);
await app.listen({ port });


