import type { MetadataRoute } from "next";

import { obtenerProductos } from "@/lib/productos";

const urlSitio =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.pisandoofertas.com.ar";

export const revalidate = 86400; // Revalidar el sitemap 1 vez al día (evita ejecuciones repetidas por crawlers)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const productos = await obtenerProductos();

  return [
    {
      url: urlSitio,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${urlSitio}/comparador`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...productos.map((producto) => ({
      url: `${urlSitio}/producto/${producto.id}`,
      lastModified: new Date(producto.updatedAt),
      changeFrequency: "daily" as const,
      priority: 0.72,
    })),
  ];
}
