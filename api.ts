// @ts-types="npm:@types/express@4.17.15"

import {express} from "express";
import cors from "cors";
const port = 8080;
const app = express();

app.use(cors());
app.use(express.json());

import {ruta} from './routes/authRoutes.ts';

app.get("/", (req, res) => {
  res.send("Welcome to the Dinosaur API!");
});

app.use('/api/auth', ruta);

app.listen(port);

console.log(`Servidor iniciado en el pueto: ${port}`);
