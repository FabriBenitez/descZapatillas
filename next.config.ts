import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
    ],
  },
};

export default nextConfig;
