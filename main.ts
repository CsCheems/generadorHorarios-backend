// @ts-types="npm:@types/express@4.17.15"

import express from "express";
const port = 8080;

const app = express();

app.get("/", (_req, res) => {
  res.send("Hello World!");
});

app.listen(port);

console.log(`Servidor iniciado en el pueto: ${port}`);
