"use client";

interface StoreBrandStyle {
  label: string;
  bg: string;
  text: string;
  border?: string;
  accent?: string;
  italic?: boolean;
  tracking?: string;
}

const STORE_STYLES: Record<string, StoreBrandStyle> = {
  dexter: {
    label: "DEXTER",
    bg: "bg-[#111111]",
    text: "text-[#FF5500]",
    italic: true,
    tracking: "tracking-tighter",
  },
  moov: {
    label: "MOOV",
    bg: "bg-[#111111]",
    text: "text-white",
    tracking: "tracking-widest",
  },
  stockcenter: {
    label: "STOCK CENTER",
    bg: "bg-[#0046AD]",
    text: "text-white",
    tracking: "tracking-tight",
  },
  grid: {
    label: "GRID",
    bg: "bg-[#111111]",
    text: "text-[#00E676]",
    tracking: "tracking-widest",
  },
  solodeportes: {
    label: "SOLO DEPORTES",
    bg: "bg-[#E30613]",
    text: "text-white",
    tracking: "tracking-tight",
  },
  opensports: {
    label: "OPEN SPORTS",
    bg: "bg-[#00843D]",
    text: "text-white",
    tracking: "tracking-tight",
  },
  sevensport: {
    label: "SEVEN SPORT",
    bg: "bg-[#111111]",
    text: "text-white",
    tracking: "tracking-tight",
  },
  sportline: {
    label: "SPORTLINE",
    bg: "bg-[#111111]",
    text: "text-[#FACC15]",
    italic: true,
    tracking: "tracking-tight",
  },
  sporting: {
    label: "SPORTING",
    bg: "bg-[#0055A5]",
    text: "text-white",
    tracking: "tracking-tight",
  },
  dashdeportes: {
    label: "DASH",
    bg: "bg-[#E5F529]",
    text: "text-[#111111]",
    italic: true,
    tracking: "tracking-tighter",
  },
  tiendafuencarral: {
    label: "FUENCARRAL",
    bg: "bg-[#111111]",
    text: "text-white",
    tracking: "tracking-wider",
  },
  tripstore: {
    label: "TRIP",
    bg: "bg-[#111111]",
    text: "text-white",
    tracking: "tracking-widest",
  },
  dionysos: {
    label: "DIONYSOS",
    bg: "bg-[#111111]",
    text: "text-[#F59E0B]",
    tracking: "tracking-wider",
  },
  adidas: {
    label: "ADIDAS",
    bg: "bg-[#111111]",
    text: "text-white",
    tracking: "tracking-widest",
  },
  puma: {
    label: "PUMA",
    bg: "bg-[#111111]",
    text: "text-white",
    italic: true,
    tracking: "tracking-wider",
  },
  reebok: {
    label: "REEBOK",
    bg: "bg-[#111111]",
    text: "text-white",
    tracking: "tracking-wider",
  },
  asics: {
    label: "ASICS",
    bg: "bg-[#001E62]",
    text: "text-white",
    italic: true,
    tracking: "tracking-wider",
  },
  underarmour: {
    label: "UNDER ARMOUR",
    bg: "bg-[#111111]",
    text: "text-white",
    tracking: "tracking-tight",
  },
  vans: {
    label: "VANS",
    bg: "bg-[#C8102E]",
    text: "text-white",
    tracking: "tracking-widest",
  },
  fila: {
    label: "FILA",
    bg: "bg-[#0B1F41]",
    text: "text-white",
    italic: true,
    tracking: "tracking-widest",
  },
  newbalance: {
    label: "NEW BALANCE",
    bg: "bg-[#CF0A2C]",
    text: "text-white",
    italic: true,
    tracking: "tracking-tight",
  },
  topper: {
    label: "TOPPER",
    bg: "bg-[#E11D48]",
    text: "text-white",
    tracking: "tracking-wider",
  },
  newsport: {
    label: "NEWSPORT",
    bg: "bg-[#0F172A]",
    text: "text-white",
    tracking: "tracking-tight",
  },
  chelsea: {
    label: "CHELSEA",
    bg: "bg-[#111111]",
    text: "text-white",
    tracking: "tracking-widest",
  },
};

function getStoreKey(storeName: string): string {
  const name = (storeName || "").toLowerCase();
  if (name.includes("stockcenter") || name.includes("stock center")) return "stockcenter";
  if (name.includes("dexter")) return "dexter";
  if (name.includes("moov")) return "moov";
  if (name.includes("grid")) return "grid";
  if (name.includes("sevensport") || name.includes("seven")) return "sevensport";
  if (name.includes("solodeportes") || name.includes("solo deportes")) return "solodeportes";
  if (name.includes("opensports") || name.includes("open sports")) return "opensports";
  if (name.includes("fuencarral") || name.includes("tiendafuencarral")) return "tiendafuencarral";
  if (name.includes("tripstore") || name.includes("trip store") || name.includes("trip")) return "tripstore";
  if (name.includes("dionysos") || name.includes("digitalsport")) return "dionysos";
  if (name.includes("reebok")) return "reebok";
  if (name.includes("asics")) return "asics";
  if (name.includes("underarmour") || name.includes("under armour")) return "underarmour";
  if (name.includes("vans")) return "vans";
  if (name.includes("fila")) return "fila";
  if (name.includes("newbalance") || name.includes("new balance")) return "newbalance";
  if (name.includes("topper")) return "topper";
  if (name.includes("adidas")) return "adidas";
  if (name.includes("puma")) return "puma";
  if (name.includes("newsport") || name.includes("new sport")) return "newsport";
  if (name.includes("chelsea")) return "chelsea";
  if (name.includes("sportline") || name.includes("sport line")) return "sportline";
  if (name.includes("sporting")) return "sporting";
  if (name.includes("dashdeportes") || name.includes("dash")) return "dashdeportes";
  return "";
}

export function StoreLogo({ storeName }: { storeName: string }) {
  const key = getStoreKey(storeName);
  const style = key ? STORE_STYLES[key] : undefined;

  if (style) {
    return (
      <span
        title={storeName}
        className={`inline-flex h-full items-center justify-center rounded-[4px] border border-[#111] px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase leading-none whitespace-nowrap select-none shadow-[1px_1px_0px_#111] ${style.bg} ${style.text} ${style.italic ? "italic" : ""} ${style.tracking ?? "tracking-tight"}`}
      >
        {style.label}
      </span>
    );
  }

  return (
    <span
      title={storeName}
      className="inline-flex h-full items-center justify-center rounded-[4px] border border-[#111] bg-[#f5f7f6] px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase leading-none text-[#111] truncate max-w-[110px] select-none shadow-[1px_1px_0px_#111]"
    >
      {storeName}
    </span>
  );
}
