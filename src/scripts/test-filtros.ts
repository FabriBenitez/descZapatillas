import { filtrarProductos } from "../lib/comparador";
import * as fs from "fs";

function testFilters() {
  const data = JSON.parse(fs.readFileSync("src/data/productos-db.json", "utf-8"));
  
  const fVacio = {
    marca: "", tienda: "", precioMinimo: "", precioMaximo: "", talle: "", genero: "", categoria: "", color: "", descuentoMinimo: "", soloStock: false, tipoOferta: "", envioGratis: false, ultimaActualizacion: ""
  };

  // Test 1: Niños
  const r1 = filtrarProductos(data, "niños", fVacio);
  const r1b = filtrarProductos(data, "niño", fVacio);
  console.log("Busqueda 'niños':", r1.length);
  console.log("Busqueda 'niño':", r1b.length);

  // Test 2: Descuento
  const fDesc = { ...fVacio, descuentoMinimo: "10" };
  const r2 = filtrarProductos(data, "", fDesc);
  console.log("Filtro descuento 10%:", r2.length);

  // Test 3: Precio
  const fPrecio = { ...fVacio, precioMaximo: "$99.999" };
  const r3 = filtrarProductos(data, "", fPrecio);
  console.log("Filtro precioMaximo $99.999:", r3.length);

  // Test 4: Tienda (solodeportes en buscador)
  const r4 = filtrarProductos(data, "solodeportes", fVacio);
  console.log("Busqueda 'solodeportes':", r4.length);

  // Test 5: Tienda (dexter en buscador vs desxter)
  const r5 = filtrarProductos(data, "dexter", fVacio);
  const r6 = filtrarProductos(data, "desxter", fVacio);
  console.log("Busqueda 'dexter':", r5.length);
  console.log("Busqueda 'desxter':", r6.length);

  // Genders
  const genders = Array.from(new Set(data.map((p: any) => p.gender)));
  console.log("Genders en DB:", genders);
}

testFilters();
