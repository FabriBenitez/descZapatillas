import type { Metadata } from "next";
import { Outfit, Syne } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";

import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const urlSitio =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.pisandoofertas.com.ar";

export const metadata: Metadata = {
  metadataBase: new URL(urlSitio),
  title: {
    default: "Pisando Ofertas | Comparador de Zapatillas y Botines en Oferta en Argentina",
    template: "%s | Pisando Ofertas",
  },
  description:
    "Buscador y comparador de ofertas de zapatillas y botines en Argentina. Compará precios, historial de descuentos y stock por talle de Dexter, StockCenter, Moov, Solo Deportes y más.",
  applicationName: "Pisando Ofertas",
  keywords: [
    "pisando ofertas",
    "pisandoofertas",
    "zapatillas en oferta",
    "botines en oferta",
    "comparador de zapatillas",
    "descuentos zapatillas argentina",
    "precios de sneakers",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Pisando Ofertas | Comparador de Zapatillas y Botines en Oferta",
    description:
      "Compará precios, descuentos e historial de zapatillas y botines de las mejores tiendas de Argentina en un solo lugar.",
    url: urlSitio,
    siteName: "Pisando Ofertas",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pisando Ofertas",
    description:
      "Comparador de ofertas de zapatillas y botines con foco en precio, descuento e historial en Argentina.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { FloatingMascot } from "@/components/FloatingMascot";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hotjarId = process.env.NEXT_PUBLIC_HOTJAR_ID || "371328";

  return (
    <html lang="es" className={`${outfit.variable} ${syne.variable}`}>
      <body className="antialiased">
        {children}
        <FloatingMascot />
        <Script
          src="https://t.contentsquare.net/uxa/c7c00dff4b4b4.js"
          strategy="afterInteractive"
        />
        {hotjarId && (
          <Script id="hotjar-tracking" strategy="afterInteractive">
            {`
              (function(h,o,t,j,a,r){
                  h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                  h._hjSettings={hjid:${hotjarId},hjsv:6};
                  a=o.getElementsByTagName('head')[0];
                  r=o.createElement('script');r.async=1;
                  r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                  a.appendChild(r);
              })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
            `}
          </Script>
        )}
        <Analytics />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
