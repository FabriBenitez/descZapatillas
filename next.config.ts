import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "www.moov.com.ar",
      },
      {
        protocol: "https",
        hostname: "essential.vteximg.com.br",
      },
      {
        protocol: "https",
        hostname: "www.dexter.com.ar",
      },
      {
        protocol: "https",
        hostname: "www.stockcenter.com.ar",
      },
      {
        protocol: "https",
        hostname: "www.opensports.com.ar",
      },
      {
        protocol: "https",
        hostname: "www-cdn.solodeportes.com.ar",
      },
      {
        protocol: "https",
        hostname: "www.digitalsport.com.ar",
      },
      {
        protocol: "https",
        hostname: "sportline.vteximg.com.br",
      },
      {
        protocol: "https",
        hostname: "sevensportio.vteximg.com.br",
      },
      {
        protocol: "https",
        hostname: "newsport.vteximg.com.br",
      },
      {
        protocol: "https",
        hostname: "dashdeportes.vteximg.com.br",
      },
      {
        protocol: "https",
        hostname: "sporting.vteximg.com.br",
      },
      {
        protocol: "https",
        hostname: "megasports.vteximg.com.br",
      },
      {
        protocol: "https",
        hostname: "chelseaio.vteximg.com.br",
      },
      {
        protocol: "https",
        hostname: "sportotalar.vteximg.com.br",
      },
      {
        protocol: "https",
        hostname: "www.grid.com.ar",
      },
      {
        protocol: "https",
        hostname: "images.nike.com",
      },
      {
        protocol: "https",
        hostname: "assets.adidas.com",
      },
      {
        protocol: "https",
        hostname: "images.puma.com",
      },
      {
        protocol: "https",
        hostname: "nb.scene7.com",
      },
      {
        protocol: "https",
        hostname: "images.converse.com",
      },
      {
        protocol: "https",
        hostname: "images.asics.com",
      },
      {
        protocol: "https",
        hostname: "images.vans.com",
      },
      {
        protocol: "https",
        hostname: "images.reebok.com",
      },
      {
        protocol: "https",
        hostname: "underarmour.scene7.com",
      },
      {
        protocol: "https",
        hostname: "images.fila.com",
      },
      {
        protocol: "https",
        hostname: "tiendain.vtexassets.com",
      },
      {
        protocol: "https",
        hostname: "celadasa.vtexassets.com",
      },
      {
        protocol: "https",
        hostname: "templofutbol.vtexassets.com",
      },
    ],
  },
  async headers() {
    return [
      {
        // Aplicar estas cabeceras a todas las rutas de la web
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff", // Evita que el navegador intente adivinar el tipo de contenido y prevenga XSS
          },
          {
            key: "X-Frame-Options",
            value: "DENY", // Evita el "Clickjacking" impidiendo que tu sitio se cargue en un iframe externo
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block", // Bloquea la carga de la página si se detecta un ataque XSS
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin", // Protege la privacidad no enviando la URL completa a otros sitios
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload", // Fuerza el uso de HTTPS
          },
        ],
      },
    ];
  },
};

export default nextConfig;
