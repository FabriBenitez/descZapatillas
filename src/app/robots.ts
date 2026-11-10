import type { MetadataRoute } from "next";

const urlSitio =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.pisandoofertas.com.ar";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: [
          "GPTBot",
          "CCBot",
          "ClaudeBot",
          "Bytespider",
          "AhrefsBot",
          "SemrushBot",
          "MJ12bot",
          "DotBot",
          "PetalBot",
        ],
        disallow: "/",
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${urlSitio}/sitemap.xml`,
  };
}
