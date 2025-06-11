import { initializeApp, applicationDefault, cert, getApps } from "firebase_admin/app";
import { getFirestore } from "firebase_admin/firestore";

// Si usas un archivo de credenciales
const serviceAccount = JSON.parse(Deno.readTextFileSync("./firebase.json"));

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

export const db = getFirestore();