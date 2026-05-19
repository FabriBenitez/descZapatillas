import type { Producto, RegistroPrecio, TipoOferta } from "@/types/producto";

interface ProductoBase {
  id: string;
  storeSlug: string;
  storeName: string;
  name: string;
  brand: string;
  category: string;
  gender: string;
  color: string;
  size?: string;
  sizes?: string[];
  price: number;
  listPrice: number;
  imageUrl: string;
  productUrl: string;
  province: string;
  available: boolean;
  updatedAt: string;
  freeShipping?: boolean;
  offerType?: TipoOferta;
  historial: Array<{
    fecha: string;
    precio: number;
    precioAnterior: number;
  }>;
}

function normalizarNombre(nombre: string) {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function calcularDescuento(precio: number, precioAnterior: number) {
  if (!precioAnterior || precioAnterior <= precio) {
    return 0;
  }

  return Math.round(((precioAnterior - precio) / precioAnterior) * 100);
}

function construirHistorial(
  historial: ProductoBase["historial"],
): RegistroPrecio[] {
  return historial.map((registro) => ({
    ...registro,
    descuento: calcularDescuento(registro.precio, registro.precioAnterior),
  }));
}

function crearProducto(base: ProductoBase): Producto {
  const historial = construirHistorial(base.historial);

  return {
    id: base.id,
    storeSlug: base.storeSlug,
    storeName: base.storeName,
    name: base.name,
    normalizedName: normalizarNombre(base.name),
    brand: base.brand,
    category: base.category,
    gender: base.gender,
    color: base.color,
    size: base.size,
    sizes: base.sizes,
    price: base.price,
    listPrice: base.listPrice,
    discount: calcularDescuento(base.price, base.listPrice),
    imageUrl: base.imageUrl,
    productUrl: base.productUrl,
    province: base.province,
    available: base.available,
    updatedAt: base.updatedAt,
    freeShipping: base.freeShipping,
    offerType: base.offerType,
    historicalBestPrice: Math.min(
      base.price,
      ...historial.map((registro) => registro.precio),
    ),
    priceHistory: historial,
  };
}

export const productosMock: Producto[] = [
  crearProducto({
    id: "nike-air-force-1-07-blanco-dexter",
    storeSlug: "dexter",
    storeName: "Dexter",
    name: "Nike Air Force 1 '07 Blanco",
    brand: "Nike",
    category: "Lifestyle",
    gender: "Unisex",
    color: "Blanco",
    size: "40",
    sizes: ["39", "40", "41", "42", "43"],
    price: 169999,
    listPrice: 219999,
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    productUrl: "https://www.dexter.com.ar/nike-air-force-1-07-blanco/p",
    province: "Buenos Aires",
    available: true,
    updatedAt: "2026-05-16T10:00:00-03:00",
    freeShipping: true,
    offerType: "flash",
    historial: [
      {
        fecha: "2026-05-16T10:00:00-03:00",
        precio: 169999,
        precioAnterior: 219999,
      },
      {
        fecha: "2026-05-14T10:00:00-03:00",
        precio: 174999,
        precioAnterior: 219999,
      },
      {
        fecha: "2026-05-10T10:00:00-03:00",
        precio: 184999,
        precioAnterior: 219999,
      },
      {
        fecha: "2026-05-04T10:00:00-03:00",
        precio: 189999,
        precioAnterior: 219999,
      },
    ],
  }),
  crearProducto({
    id: "adidas-campus-00s-grid",
    storeSlug: "grid",
    storeName: "Grid",
    name: "Adidas Campus 00s Core Black",
    brand: "Adidas",
    category: "Lifestyle",
    gender: "Unisex",
    color: "Negro",
    size: "41",
    sizes: ["39", "40", "41", "42"],
    price: 189999,
    listPrice: 249999,
    imageUrl:
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=900&q=80",
    productUrl: "https://www.grid.com.ar/adidas-campus-00s-core-black/p",
    province: "CABA",
    available: true,
    updatedAt: "2026-05-16T09:00:00-03:00",
    freeShipping: true,
    offerType: "outlet",
    historial: [
      {
        fecha: "2026-05-16T09:00:00-03:00",
        precio: 189999,
        precioAnterior: 249999,
      },
      {
        fecha: "2026-05-13T09:00:00-03:00",
        precio: 194999,
        precioAnterior: 249999,
      },
      {
        fecha: "2026-05-08T09:00:00-03:00",
        precio: 204999,
        precioAnterior: 249999,
      },
      {
        fecha: "2026-05-01T09:00:00-03:00",
        precio: 214999,
        precioAnterior: 249999,
      },
    ],
  }),
  crearProducto({
    id: "puma-suede-xl-moov",
    storeSlug: "moov",
    storeName: "Moov",
    name: "Puma Suede XL Classic Green",
    brand: "Puma",
    category: "Skate",
    gender: "Hombre",
    color: "Verde",
    size: "42",
    sizes: ["40", "41", "42", "43"],
    price: 124999,
    listPrice: 174999,
    imageUrl:
      "https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=900&q=80",
    productUrl: "https://www.moov.com.ar/puma-suede-xl-classic-green/p",
    province: "Cordoba",
    available: true,
    updatedAt: "2026-05-16T08:30:00-03:00",
    freeShipping: false,
    offerType: "liquidacion",
    historial: [
      {
        fecha: "2026-05-16T08:30:00-03:00",
        precio: 124999,
        precioAnterior: 174999,
      },
      {
        fecha: "2026-05-12T08:30:00-03:00",
        precio: 129999,
        precioAnterior: 174999,
      },
      {
        fecha: "2026-05-06T08:30:00-03:00",
        precio: 139999,
        precioAnterior: 174999,
      },
      {
        fecha: "2026-04-30T08:30:00-03:00",
        precio: 149999,
        precioAnterior: 174999,
      },
    ],
  }),
  crearProducto({
    id: "new-balance-530-stockcenter",
    storeSlug: "stock-center",
    storeName: "Stock Center",
    name: "New Balance 530 Silver Navy",
    brand: "New Balance",
    category: "Running",
    gender: "Mujer",
    color: "Plateado",
    size: "38",
    sizes: ["37", "38", "39", "40"],
    price: 209999,
    listPrice: 269999,
    imageUrl:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80",
    productUrl:
      "https://www.stockcenter.com.ar/new-balance-530-silver-navy/p",
    province: "Santa Fe",
    available: true,
    updatedAt: "2026-05-15T19:00:00-03:00",
    freeShipping: true,
    offerType: "temporada",
    historial: [
      {
        fecha: "2026-05-15T19:00:00-03:00",
        precio: 209999,
        precioAnterior: 269999,
      },
      {
        fecha: "2026-05-11T19:00:00-03:00",
        precio: 214999,
        precioAnterior: 269999,
      },
      {
        fecha: "2026-05-05T19:00:00-03:00",
        precio: 224999,
        precioAnterior: 269999,
      },
      {
        fecha: "2026-04-29T19:00:00-03:00",
        precio: 229999,
        precioAnterior: 269999,
      },
    ],
  }),
  crearProducto({
    id: "converse-chuck-70-plus-open-sports",
    storeSlug: "open-sports",
    storeName: "Open Sports",
    name: "Converse Chuck 70 Plus Canvas",
    brand: "Converse",
    category: "Lifestyle",
    gender: "Unisex",
    color: "Crudo",
    size: "39",
    sizes: ["38", "39", "40", "41", "42"],
    price: 119999,
    listPrice: 149999,
    imageUrl:
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=80",
    productUrl:
      "https://www.opensports.com.ar/converse-chuck-70-plus-canvas/p",
    province: "Mendoza",
    available: false,
    updatedAt: "2026-05-15T17:20:00-03:00",
    freeShipping: false,
    offerType: "outlet",
    historial: [
      {
        fecha: "2026-05-15T17:20:00-03:00",
        precio: 119999,
        precioAnterior: 149999,
      },
      {
        fecha: "2026-05-09T17:20:00-03:00",
        precio: 124999,
        precioAnterior: 149999,
      },
      {
        fecha: "2026-05-02T17:20:00-03:00",
        precio: 129999,
        precioAnterior: 149999,
      },
      {
        fecha: "2026-04-25T17:20:00-03:00",
        precio: 134999,
        precioAnterior: 149999,
      },
    ],
  }),
  crearProducto({
    id: "asics-gel-1130-digital-sport",
    storeSlug: "digital-sport",
    storeName: "Digital Sport",
    name: "Asics Gel-1130 White Pure Silver",
    brand: "Asics",
    category: "Running",
    gender: "Hombre",
    color: "Blanco",
    size: "42",
    sizes: ["40", "41", "42", "43", "44"],
    price: 229999,
    listPrice: 289999,
    imageUrl:
      "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=900&q=80",
    productUrl:
      "https://www.digitalsport.com.ar/asics-gel-1130-white-pure-silver/p",
    province: "Buenos Aires",
    available: true,
    updatedAt: "2026-05-15T16:10:00-03:00",
    freeShipping: true,
    offerType: "temporada",
    historial: [
      {
        fecha: "2026-05-15T16:10:00-03:00",
        precio: 229999,
        precioAnterior: 289999,
      },
      {
        fecha: "2026-05-10T16:10:00-03:00",
        precio: 239999,
        precioAnterior: 289999,
      },
      {
        fecha: "2026-05-03T16:10:00-03:00",
        precio: 244999,
        precioAnterior: 289999,
      },
      {
        fecha: "2026-04-26T16:10:00-03:00",
        precio: 249999,
        precioAnterior: 289999,
      },
    ],
  }),
  crearProducto({
    id: "nike-dunk-low-retro-nike-factory",
    storeSlug: "nike-factory",
    storeName: "Nike Factory",
    name: "Nike Dunk Low Retro Panda",
    brand: "Nike",
    category: "Basket",
    gender: "Unisex",
    color: "Blanco y Negro",
    size: "41",
    sizes: ["39", "40", "41", "42", "43"],
    price: 194999,
    listPrice: 239999,
    imageUrl:
      "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=900&q=80",
    productUrl:
      "https://www.nike.com/ar/t/dunk-low-retro-panda-zapatillas/p",
    province: "Buenos Aires",
    available: true,
    updatedAt: "2026-05-15T13:40:00-03:00",
    freeShipping: true,
    offerType: "flash",
    historial: [
      {
        fecha: "2026-05-15T13:40:00-03:00",
        precio: 194999,
        precioAnterior: 239999,
      },
      {
        fecha: "2026-05-11T13:40:00-03:00",
        precio: 199999,
        precioAnterior: 239999,
      },
      {
        fecha: "2026-05-06T13:40:00-03:00",
        precio: 209999,
        precioAnterior: 239999,
      },
      {
        fecha: "2026-04-28T13:40:00-03:00",
        precio: 214999,
        precioAnterior: 239999,
      },
    ],
  }),
  crearProducto({
    id: "adidas-response-cl-adidas",
    storeSlug: "adidas-ar",
    storeName: "Adidas",
    name: "Adidas Response CL Sand Strata",
    brand: "Adidas",
    category: "Running",
    gender: "Hombre",
    color: "Beige",
    size: "43",
    sizes: ["41", "42", "43", "44"],
    price: 159999,
    listPrice: 189999,
    imageUrl:
      "https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&w=900&q=80",
    productUrl: "https://www.adidas.com.ar/response-cl-sand-strata/p",
    province: "Cordoba",
    available: true,
    updatedAt: "2026-05-14T22:15:00-03:00",
    freeShipping: true,
    offerType: "temporada",
    historial: [
      {
        fecha: "2026-05-14T22:15:00-03:00",
        precio: 159999,
        precioAnterior: 189999,
      },
      {
        fecha: "2026-05-08T22:15:00-03:00",
        precio: 164999,
        precioAnterior: 189999,
      },
      {
        fecha: "2026-05-02T22:15:00-03:00",
        precio: 169999,
        precioAnterior: 189999,
      },
      {
        fecha: "2026-04-24T22:15:00-03:00",
        precio: 174999,
        precioAnterior: 189999,
      },
    ],
  }),
  crearProducto({
    id: "vans-knu-skool-dionysos",
    storeSlug: "dionysos",
    storeName: "Dionysos",
    name: "Vans Knu Skool Black White",
    brand: "Vans",
    category: "Skate",
    gender: "Unisex",
    color: "Negro",
    size: "40",
    sizes: ["38", "39", "40", "41", "42"],
    price: 139999,
    listPrice: 179999,
    imageUrl:
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=900&q=80",
    productUrl: "https://www.dionysos.com.ar/vans-knu-skool-black-white/p",
    province: "CABA",
    available: true,
    updatedAt: "2026-05-14T20:30:00-03:00",
    freeShipping: false,
    offerType: "liquidacion",
    historial: [
      {
        fecha: "2026-05-14T20:30:00-03:00",
        precio: 139999,
        precioAnterior: 179999,
      },
      {
        fecha: "2026-05-09T20:30:00-03:00",
        precio: 144999,
        precioAnterior: 179999,
      },
      {
        fecha: "2026-05-03T20:30:00-03:00",
        precio: 149999,
        precioAnterior: 179999,
      },
      {
        fecha: "2026-04-27T20:30:00-03:00",
        precio: 154999,
        precioAnterior: 179999,
      },
    ],
  }),
  crearProducto({
    id: "reebok-club-c-85-sportline",
    storeSlug: "sportline",
    storeName: "Sportline",
    name: "Reebok Club C 85 Vintage",
    brand: "Reebok",
    category: "Lifestyle",
    gender: "Mujer",
    color: "Blanco Tiza",
    size: "38",
    sizes: ["36", "37", "38", "39"],
    price: 129999,
    listPrice: 169999,
    imageUrl:
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=900&q=80",
    productUrl: "https://www.sportline.com.ar/reebok-club-c-85-vintage/p",
    province: "Santa Fe",
    available: true,
    updatedAt: "2026-05-14T18:10:00-03:00",
    freeShipping: true,
    offerType: "outlet",
    historial: [
      {
        fecha: "2026-05-14T18:10:00-03:00",
        precio: 129999,
        precioAnterior: 169999,
      },
      {
        fecha: "2026-05-08T18:10:00-03:00",
        precio: 134999,
        precioAnterior: 169999,
      },
      {
        fecha: "2026-05-01T18:10:00-03:00",
        precio: 139999,
        precioAnterior: 169999,
      },
      {
        fecha: "2026-04-23T18:10:00-03:00",
        precio: 144999,
        precioAnterior: 169999,
      },
    ],
  }),
  crearProducto({
    id: "under-armour-phantom-solo-deportes",
    storeSlug: "solo-deportes",
    storeName: "Solo Deportes",
    name: "Under Armour Phantom 4 Knit",
    brand: "Under Armour",
    category: "Training",
    gender: "Hombre",
    color: "Gris",
    size: "42",
    sizes: ["40", "41", "42", "43"],
    price: 154999,
    listPrice: 204999,
    imageUrl:
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=900&q=80",
    productUrl:
      "https://www.solodeportes.com.ar/under-armour-phantom-4-knit/p",
    province: "Mendoza",
    available: true,
    updatedAt: "2026-05-14T12:00:00-03:00",
    freeShipping: false,
    offerType: "liquidacion",
    historial: [
      {
        fecha: "2026-05-14T12:00:00-03:00",
        precio: 154999,
        precioAnterior: 204999,
      },
      {
        fecha: "2026-05-10T12:00:00-03:00",
        precio: 159999,
        precioAnterior: 204999,
      },
      {
        fecha: "2026-05-05T12:00:00-03:00",
        precio: 164999,
        precioAnterior: 204999,
      },
      {
        fecha: "2026-04-29T12:00:00-03:00",
        precio: 169999,
        precioAnterior: 204999,
      },
    ],
  }),
  crearProducto({
    id: "fila-disruptor-feria-sneakers",
    storeSlug: "feria-sneakers",
    storeName: "Feria Sneakers",
    name: "Fila Disruptor II Premium",
    brand: "Fila",
    category: "Lifestyle",
    gender: "Mujer",
    color: "Rosa",
    size: "37",
    sizes: ["36", "37", "38", "39"],
    price: 114999,
    listPrice: 159999,
    imageUrl:
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80",
    productUrl:
      "https://www.feriasneakers.com.ar/fila-disruptor-ii-premium/p",
    province: "Buenos Aires",
    available: true,
    updatedAt: "2026-05-13T21:45:00-03:00",
    freeShipping: true,
    offerType: "flash",
    historial: [
      {
        fecha: "2026-05-13T21:45:00-03:00",
        precio: 114999,
        precioAnterior: 159999,
      },
      {
        fecha: "2026-05-08T21:45:00-03:00",
        precio: 119999,
        precioAnterior: 159999,
      },
      {
        fecha: "2026-05-02T21:45:00-03:00",
        precio: 124999,
        precioAnterior: 159999,
      },
      {
        fecha: "2026-04-26T21:45:00-03:00",
        precio: 129999,
        precioAnterior: 159999,
      },
    ],
  }),
];
