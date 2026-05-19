import type { MetadataRoute } from "next";

const urlSitio =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://pisando-ofertas.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${urlSitio}/sitemap.xml`,
  };
}
