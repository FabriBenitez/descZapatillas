import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PriceHistory } from "@/components/PriceHistory";
import { ProductDetail } from "@/components/ProductDetail";
import { SimilarProducts } from "@/components/SimilarProducts";
import { calcularProductosSimilares } from "@/lib/comparador";
import { obtenerProductoPorId, obtenerProductos } from "@/lib/productos";

interface ProductoPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ f?: string }>;
}

export const revalidate = 60; // Revalidar cada 60 segundos
export const maxDuration = 60; // Prevenir error 500 por timeout en Vercel

export async function generateMetadata({
  params,
  searchParams,
}: ProductoPageProps): Promise<Metadata> {
  const { id } = await params;
  const { f } = await searchParams;
  let producto = await obtenerProductoPorId(id);

  if (!producto && f) {
    try {
      const parsed = JSON.parse(decodeURIComponent(f));
      // Basic validation
      if (parsed && typeof parsed.name === "string" && typeof parsed.price === "number") {
        producto = parsed;
      }
    } catch (err) {
      // ignore
    }
  }

  if (!producto) {
    return {
      title: "Producto no encontrado",
    };
  }

  // Sanitizar nombre para metadata (prevenir XSS si viene inyectado de la URL)
  const safeName = producto.name.replace(/<[^>]*>?/gm, '');

  return {
    title: `${safeName} en oferta`,
    description: `${safeName} disponible en ${producto.storeName}, ${producto.province}. Consulta precio actual, descuento, talles e historial.`,
    alternates: {
      canonical: `/producto/${producto.id}`,
    },
    openGraph: {
      title: `${safeName} | Pisando Ofertas`,
      description: `Precio actual ${producto.price} con descuento del ${producto.discount}% en ${producto.storeName}.`,
      url: `/producto/${producto.id}`,
      images: [
        {
          url: producto.imageUrl,
          alt: safeName,
        },
      ],
    },
  };
}

export default async function ProductoPage({ params, searchParams }: ProductoPageProps) {
  const { id } = await params;
  const { f } = await searchParams;
  
  let productoBase = await obtenerProductoPorId(id);
  let esFresco = false;
  
  if (!productoBase && f) {
    try {
      const parsed = JSON.parse(decodeURIComponent(f));
      if (parsed && typeof parsed.name === "string" && typeof parsed.price === "number") {
        productoBase = parsed;
        esFresco = true;
      }
    } catch {
      // ignore
    }
  }

  if (!productoBase) {
    notFound();
  }

  // Sanitizar si viene de la URL
  if (esFresco) {
    productoBase.name = productoBase.name.replace(/<[^>]*>?/gm, '');
  }

  // Solo buscar similares si el producto existe en DB (evita cargar todo el JSON en memoria para un producto fresco)
  const productos = esFresco ? [] : await obtenerProductos();
  const productosSimilares = esFresco ? [] : calcularProductosSimilares(productoBase, productos, 4);

  return (
    <>
      <Header />
      <main className="flex-1 pb-10">
        <section className="pt-8">
          <div className="contenedor flex flex-col gap-8">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Link href="/" className="chip">
                Inicio
              </Link>
              <span className="text-[var(--color-muted)]">/</span>
              <Link href="/comparador" className="chip">
                Comparador
              </Link>
              <span className="text-[var(--color-muted)]">/</span>
              <span className="chip bg-[var(--color-tinta)] text-white">
                {productoBase.brand}
              </span>
            </div>

            <ProductDetail producto={productoBase} />
            <PriceHistory producto={productoBase} />
            
            {productosSimilares.length > 0 && (
              <SimilarProducts productos={productosSimilares} />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
