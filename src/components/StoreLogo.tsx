"use client";

import { useState } from "react";

// Mapeo de nombre de tienda → logo oficial
const STORE_LOGOS: Record<string, string> = {
  stockcenter:
    "https://www.stockcenter.com.ar/on/demandware.static/Sites-StockCenter-Site/-/default/dw066a7b75/images/logo.svg",
  dexter:
    "https://www.dexter.com.ar/on/demandware.static/Sites-Dexter-Site/-/default/dw1ea751d3/images/logo.svg",
  moov:
    "https://www.moov.com.ar/on/demandware.static/Sites-Moov-Site/-/default/dw066a7b75/images/logo.svg",
  grid:
    "https://grid0.vteximg.com.br/arquivos/logo-grid.svg",
};

// Dominio de cada tienda para el favicon de Google (fallback garantizado)
const STORE_DOMAINS: Record<string, string> = {
  stockcenter: "stockcenter.com.ar",
  dexter: "dexter.com.ar",
  moov: "moov.com.ar",
  grid: "grid.com.ar",
  sevensport: "sevensport.com.ar",
  solodeportes: "solodeportes.com.ar",
  // Quitamos fuencarral para que no traiga el globito de Google
};

function getStoreKey(storeName: string): string {
  const name = storeName.toLowerCase();
  if (name.includes("stockcenter")) return "stockcenter";
  if (name.includes("dexter")) return "dexter";
  if (name.includes("moov")) return "moov";
  if (name.includes("grid")) return "grid";
  if (name.includes("sevensport") || name.includes("seven")) return "sevensport";
  if (name.includes("solo") || name.includes("solodeportes")) return "solodeportes";
  if (name.includes("fuencarral")) return "fuencarral";
  if (name.includes("dash")) return "dash";
  return "";
}

function getFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

export function StoreLogo({ storeName }: { storeName: string }) {
  const [logoFailed, setLogoFailed] = useState(false);
  const [faviconFailed, setFaviconFailed] = useState(false);

  const key = getStoreKey(storeName);
  const logoUrl = key ? STORE_LOGOS[key] : undefined;
  const domain = key ? STORE_DOMAINS[key] : undefined;

  // 1) Logo oficial SVG/PNG (alta calidad, ancho completo)
  if (logoUrl && !logoFailed) {
    // Si el logo es originalmente blanco, lo invertimos/oscurecemos para que se vea en el fondo gris claro
    const needsInvert = key === "stockcenter" || key === "dexter" || key === "moov";
    
    return (
      <div className="flex h-full items-center justify-center overflow-hidden w-full" title={storeName}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt={`Logo de ${storeName}`}
          onError={() => setLogoFailed(true)}
          className={`h-5 max-w-[80px] object-contain ${needsInvert ? "brightness-0" : ""}`}
        />
      </div>
    );
  }

  // 2) Favicon de Google (128px, garantizado para cualquier dominio válido)
  if (domain && !faviconFailed) {
    return (
      <div className="flex h-full items-center justify-center gap-1.5 overflow-hidden" title={storeName}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getFaviconUrl(domain)}
          alt={`Logo de ${storeName}`}
          onError={() => setFaviconFailed(true)}
          className="h-5 w-5 rounded-[4px] object-contain"
        />
        <span className="text-[#111] font-bold text-[10px] truncate">
          {storeName}
        </span>
      </div>
    );
  }

  // 3) Fallbacks personalizados o texto plano (último recurso)
  if (key === "dash") {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#E5F529] rounded-[6px] shadow-sm border border-black/10" title={storeName}>
        <span className="text-black font-black text-[11px] uppercase italic tracking-tighter">DASH</span>
      </div>
    );
  }

  if (key === "fuencarral") {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black rounded-[6px] shadow-sm" title={storeName}>
        <span className="text-white font-bold text-[9px] uppercase tracking-widest">Fuencarral</span>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-white rounded-[6px] border border-[#e2e7e4] shadow-sm" title={storeName}>
      <span className="text-[#111] font-bold text-[10px] truncate max-w-[80px] px-1">
        {storeName}
      </span>
    </div>
  );
}
