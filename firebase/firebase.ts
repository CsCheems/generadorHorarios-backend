import admin from "firebase_admin";
//import { readJson } from "https://deno.land/x/jsonfile@1.0.0/mod.ts";

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(Deno.env.get("FIREBASE_CONFIG") ?? "{}");
  // Corrige los saltos de línea en la clave privada
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const db = admin.firestore();

function keepAlive() {
  setInterval(async () => {
    try {
      // Consulta rápida a Firestore para mantener la conexión viva
      await db.collection("_health_check").limit(1).get();
      console.log("💓 Firestore alive");
    } catch (err: any) {
      console.warn("⚠️ Firestore ping fallido:", err.message);
    }
  }, 2 * 60 * 1000); // cada 2 minutos
}

keepAlive();

export default admin;