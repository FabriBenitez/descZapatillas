import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PriceHistory } from "@/components/PriceHistory";
import { ProductDetail } from "@/components/ProductDetail";
import { SimilarProducts } from "@/components/SimilarProducts";
import { calcularProductosSimilares } from "@/lib/comparador";
import { obtenerProductoPorId, obtenerProductosSinHistorial } from "@/lib/productos";

interface ProductoPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 86400; // Cachear en CDN 24 horas (ISR real sin prefetch masivo)

export async function generateMetadata({
  params,
}: ProductoPageProps): Promise<Metadata> {
  const { id } = await params;
  const producto = await obtenerProductoPorId(id);

  if (!producto) {
    return {
      title: "Producto no encontrado",
    };
  }

  // Sanitizar nombre para metadata
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

export default async function ProductoPage({ params }: ProductoPageProps) {
  const { id } = await params;
  const productoBase = await obtenerProductoPorId(id);

  if (!productoBase) {
    notFound();
  }

  const productos = await obtenerProductosSinHistorial();
  const productosSimilares = calcularProductosSimilares(productoBase, productos, 4);

  return (
    <>
      <Header />
      <main className="flex-1 pb-6 sm:pb-10">
        <section className="pt-4 sm:pt-8">
          <div className="contenedor flex flex-col gap-5 sm:gap-8">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
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
