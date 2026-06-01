import { collection, getDocs } from "firebase/firestore/lite";
import { obtenerFirestoreCliente, obtenerAplicacionFirebase } from "../src/lib/firebase.js"; // Needs to be compiled or run with tsx

async function testFirebase() {
  console.log("Configured:", !!obtenerAplicacionFirebase());
  const db = obtenerFirestoreCliente();
  if (!db) {
    console.log("No DB");
    return;
  }
  console.log("DB obtained, fetching products...");
  try {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);
    console.log("Total in Firebase:", snapshot.size);
  } catch (err) {
    console.error("Firebase error:", err);
  }
}

testFirebase();
