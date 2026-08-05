import type { MetadataRoute } from "next";

import { obtenerProductos } from "@/lib/productos";

const urlSitio =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.pisandoofertas.com.ar";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const productos = await obtenerProductos();

  return [
    {
      url: urlSitio,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${urlSitio}/comparador`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    ...productos.map((producto) => ({
      url: `${urlSitio}/producto/${producto.id}`,
      lastModified: new Date(producto.updatedAt),
      changeFrequency: "hourly" as const,
      priority: 0.72,
    })),
  ];
}
