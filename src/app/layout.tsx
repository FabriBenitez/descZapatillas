import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";

import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

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
  const hotjarId = process.env.NEXT_PUBLIC_HOTJAR_ID || "371328";

  return (
    <html lang="es" className={`${plusJakartaSans.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased">
        {children}
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
