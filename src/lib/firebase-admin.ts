import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let db: Firestore | null = null;

export function obtenerFirestoreAdmin(): Firestore | null {
  if (db) return db;

  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.warn("⚠️ Variable FIREBASE_SERVICE_ACCOUNT no configurada. Usando fallback local.");
    return null;
  }

  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    if (getApps().length === 0) {
      const app = initializeApp({
        credential: cert(serviceAccount)
      });
      db = getFirestore(app);
    } else {
      db = getFirestore(getApps()[0]);
    }
  } catch (error) {
    console.warn("⚠️ Error al inicializar Firebase Admin:", error);
  }

  return db;
}
