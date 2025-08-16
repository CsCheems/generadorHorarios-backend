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
export default admin;