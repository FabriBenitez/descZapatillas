/**
 * Módulo de Firebase para uso en scripts de Node.js (GitHub Actions, servidor).
 * Usa el SDK cliente estándar de Firebase con la API key de entorno,
 * evitando la necesidad de Service Account credentials.
 */
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

export function obtenerFirestoreAdmin(): Firestore | null {
  if (db) return db;

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || !projectId) {
    console.warn("⚠️ Variables de Firebase no configuradas. Usando fallback local.");
    return null;
  }

  try {
    if (getApps().length === 0) {
      app = initializeApp({
        apiKey,
        authDomain,
        projectId,
        storageBucket,
        messagingSenderId,
        appId,
      });
    } else {
      app = getApps()[0];
    }

    db = getFirestore(app);
    console.log(`🔌 Firebase conectado al proyecto: ${projectId}`);
    return db;
  } catch (error) {
    console.error("❌ Error inicializando Firebase:", error);
    return null;
  }
}
