# Imagen oficial de Deno 2.3.5
FROM denoland/deno:2.3.5

WORKDIR /app

# Copia todo el proyecto
COPY . .

# Expone el puerto (Render lo asigna con $PORT)
EXPOSE 8080

# Ejecuta tu app
CMD ["run", "-A", "api.ts"]