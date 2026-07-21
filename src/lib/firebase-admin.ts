/**
 * Firebase Admin SDK para uso en scripts de Node.js (GitHub Actions, servidor).
 * A diferencia de firebase/firestore/lite (que es para browsers),
 * firebase-admin funciona con autenticación por variables de entorno en servidores.
 */
import { initializeApp, getApps, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let adminApp: App | null = null;
let adminDb: Firestore | null = null;

export function obtenerFirestoreAdmin(): Firestore | null {
  if (adminDb) return adminDb;

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (!projectId || !apiKey) {
    console.warn("⚠️ Variables de Firebase no configuradas. Usando fallback local.");
    return null;
  }

  try {
    // En GitHub Actions usamos las variables de entorno directamente.
    // firebase-admin puede autenticarse con Application Default Credentials
    // o con el projectId solamente para Firestore en modo "no auth" (reglas abiertas).
    if (getApps().length === 0) {
      adminApp = initializeApp({
        projectId,
      });
    } else {
      adminApp = getApps()[0];
    }

    adminDb = getFirestore(adminApp);
    // Apuntar al proyecto correcto
    return adminDb;
  } catch (error) {
    console.error("❌ Error inicializando Firebase Admin:", error);
    return null;
  }
}
