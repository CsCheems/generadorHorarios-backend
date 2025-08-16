# Usa la versión exacta de Deno que usas localmente
FROM denoland/deno:2.3.5

# Carpeta de trabajo
WORKDIR /app

# Copia todos los archivos del proyecto
COPY . .

# Exponer el puerto (Render usará $PORT)
EXPOSE 8080

# Comando para ejecutar la app
# Render pasará la variable de entorno PORT automáticamente
CMD ["run", "-A", "api.ts"]