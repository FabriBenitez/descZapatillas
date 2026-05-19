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
}

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

  return {
    title: `${producto.name} en oferta`,
    description: `${producto.name} disponible en ${producto.storeName}, ${producto.province}. Consulta precio actual, descuento, talles e historial.`,
    alternates: {
      canonical: `/producto/${producto.id}`,
    },
    openGraph: {
      title: `${producto.name} | Pisando Ofertas`,
      description: `Precio actual ${producto.price} con descuento del ${producto.discount}% en ${producto.storeName}.`,
      url: `/producto/${producto.id}`,
      images: [
        {
          url: producto.imageUrl,
          alt: producto.name,
        },
      ],
    },
  };
}

export default async function ProductoPage({ params }: ProductoPageProps) {
  const { id } = await params;
  const [producto, productos] = await Promise.all([
    obtenerProductoPorId(id),
    obtenerProductos(),
  ]);

  if (!producto) {
    notFound();
  }

  const productosSimilares = calcularProductosSimilares(producto, productos, 4);

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
                {producto.brand}
              </span>
            </div>

            <ProductDetail producto={producto} />
            <PriceHistory producto={producto} />
            <SimilarProducts productos={productosSimilares} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
