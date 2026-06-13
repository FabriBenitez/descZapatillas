import type { Producto } from "@/types/producto";

/**
 * Genera un enlace de afiliado o agrega UTMs a los enlaces salientes
 * para trackear clics desde pisandoofertas.
 */
export function generarEnlaceAfiliado(producto: Producto): string {
  try {
    const url = new URL(producto.productUrl);
    
    // Si la URL ya tiene UTMs, no la modificamos por las dudas
    if (url.searchParams.has("utm_source")) {
      return url.toString();
    }

    url.searchParams.set("utm_source", "pisandoofertas");
    url.searchParams.set("utm_medium", "comparador");

    return url.toString();
  } catch (error) {
    // Si la URL es inválida, devolvemos la original
    return producto.productUrl;
  }
}
