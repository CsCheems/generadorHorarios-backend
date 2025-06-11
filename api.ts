import { Application } from "@oak/oak";
import { ruta } from "./routes/authRoutes.ts";

const app = new Application();
const port = 8080;

app.use(ruta.routes());
app.use(ruta.allowedMethods());

console.log(`Servidor iniciado en el puerto: ${port}`);
await app.listen({ port });

