import type { Metadata } from "next";

import "./globals.css";

const urlSitio =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://pisando-ofertas.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(urlSitio),
  title: {
    default: "Pisando Ofertas | Comparador de zapatillas en oferta",
    template: "%s | Pisando Ofertas",
  },
  description:
    "Landing y comparador de ofertas de zapatillas para buscar por marca, tienda, categoria y precio con historial y descuentos visibles.",
  applicationName: "Pisando Ofertas",
  keywords: [
    "zapatillas en oferta",
    "comparador de zapatillas",
    "precios de sneakers",
    "descuentos de zapatillas",
    "pisando ofertas",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Pisando Ofertas",
    description:
      "Compara precios, descuentos e historial de zapatillas de distintas tiendas en un solo lugar.",
    url: urlSitio,
    siteName: "Pisando Ofertas",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pisando Ofertas",
    description:
      "Comparador moderno de ofertas de zapatillas con foco en precio, descuento e historial.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
