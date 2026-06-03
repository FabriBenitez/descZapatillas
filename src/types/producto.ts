export type TipoOferta = "flash" | "outlet" | "liquidacion" | "temporada";

export type OrdenProductos =
  | "precio-asc"
  | "precio-desc"
  | "descuento-desc"
  | "descuento-asc"
  | "recientes"
  | "historico";

export interface RegistroPrecio {
  fecha: string;
  precio: number;
  precioAnterior: number;
  descuento: number;
}

export interface Producto {
  id: string;
  storeSlug: string;
  storeName: string;
  name: string;
  normalizedName: string;
  brand: string;
  category: string | null;
  gender: string;
  color: string;
  size?: string;
  sizes?: string[];
  price: number;
  listPrice: number;
  discount: number;
  imageUrl: string;
  productUrl: string;
  province: string;
  available: boolean;
  updatedAt: string;
  freeShipping?: boolean;
  offerType?: TipoOferta;
  historicalBestPrice?: number;
  priceHistory?: RegistroPrecio[];
  isFresh?: boolean;
}

export interface FiltrosProductos {
  marca: string;
  tienda: string;
  precioMinimo: string;
  precioMaximo: string;
  talle: string;
  genero: string;
  categoria: string;
  color: string;
  descuentoMinimo: string;
  soloStock: boolean;
  tipoOferta: string;
  envioGratis: boolean;
  ultimaActualizacion: string;
}

export const filtrosIniciales: FiltrosProductos = {
  marca: "",
  tienda: "",
  precioMinimo: "",
  precioMaximo: "",
  talle: "",
  genero: "",
  categoria: "",
  color: "",
  descuentoMinimo: "",
  soloStock: false,
  tipoOferta: "",
  envioGratis: false,
  ultimaActualizacion: "",
};
