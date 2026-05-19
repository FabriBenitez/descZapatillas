import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore/lite";

interface ConfiguracionFirebase {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

let aplicacionFirebase: FirebaseApp | null = null;
let baseDatosFirebase: Firestore | null = null;

function obtenerConfiguracionFirebase(): ConfiguracionFirebase | null {
  const configuracion: ConfiguracionFirebase = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  };

  const configuracionCompleta = Object.values(configuracion).every(Boolean);

  return configuracionCompleta ? configuracion : null;
}

export function tieneFirebaseConfigurado() {
  return Boolean(obtenerConfiguracionFirebase());
}

export function obtenerAplicacionFirebase() {
  if (aplicacionFirebase) {
    return aplicacionFirebase;
  }

  const configuracion = obtenerConfiguracionFirebase();

  if (!configuracion) {
    return null;
  }

  aplicacionFirebase =
    getApps().length > 0 ? getApp() : initializeApp(configuracion);

  return aplicacionFirebase;
}

export function obtenerFirestoreCliente() {
  if (baseDatosFirebase) {
    return baseDatosFirebase;
  }

  const aplicacion = obtenerAplicacionFirebase();

  if (!aplicacion) {
    return null;
  }

  baseDatosFirebase = getFirestore(aplicacion);

  return baseDatosFirebase;
}
