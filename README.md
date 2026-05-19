# Pisando Ofertas

Landing + comparador de ofertas de zapatillas construido con:

- Next.js 16
- TypeScript
- Tailwind CSS 4
- Firebase / Firestore preparado como fuente de datos
- UI responsive mobile-first

## Objetivo

Mostrar zapatillas en oferta de distintas tiendas, comparar precios, destacar descuentos, ver historial y redirigir al producto original en la tienda correspondiente.

## Puesta en marcha

1. Instalar dependencias:

```bash
npm install
```

2. Crear variables de entorno a partir de `.env.example`:

```bash
cp .env.example .env.local
```

3. Levantar el entorno local:

```bash
npm run dev
```

4. Validar calidad:

```bash
npm run lint
npm run build
```

## Firestore

La aplicacion ya tiene un fallback a datos mock para desarrollo visual.

Si cargás estas variables en `.env.local`, `src/lib/productos.ts` intentará leer la colección `products` desde Firestore:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## Estructura principal

- `src/app`: rutas, layout, SEO, sitemap y robots
- `src/components`: UI separada por componente
- `src/data/productos-mock.ts`: catálogo mock para pruebas
- `src/lib/firebase.ts`: inicialización lazy de Firebase
- `src/lib/productos.ts`: acceso a productos con fallback a mocks
- `src/lib/comparador.ts`: filtros, ordenamiento y similares
- `src/lib/connectors/dexter.ts`: conector Salesforce Commerce Cloud para ofertas de zapatillas en Dexter
- `src/lib/connectors/grid.ts`: conector VTEX para ofertas de zapatillas en Grid
- `src/lib/connectors/moov.ts`: conector Salesforce Commerce Cloud para ofertas de zapatillas en Moov
- `src/types/producto.ts`: modelo principal

## Conector Moov

Moov no usa VTEX; usa Salesforce Commerce Cloud / Demandware. El conector consulta la grilla de sale con búsqueda `zapatillas`, parsea el HTML y normaliza al modelo `Producto`.

Endpoint de prueba local:

```bash
http://localhost:3000/api/connectors/moov?size=3
```

Endpoint fuente:

```txt
https://www.moov.com.ar/on/demandware.store/Sites-Moov-Site/default/Search-UpdateGrid?cgid=sale&q=zapatillas&srule=product-discount&start=0&sz=36
```

## Conector Grid

Grid usa VTEX. El conector consulta la Search API con `ft=zapatillas`, ordena por mejor descuento y normaliza precio, precio de lista, talles, color, genero e imagen al modelo `Producto`.

Endpoint de prueba local:

```bash
http://localhost:3000/api/connectors/grid?size=3
```

Endpoint fuente:

```txt
https://www.grid.com.ar/api/catalog_system/pub/products/search?ft=zapatillas&_from=0&_to=49&O=OrderByBestDiscountDESC
```

## Conector Dexter

Dexter usa Salesforce Commerce Cloud / Demandware. El conector consulta la grilla `hot-sale` con busqueda `zapatillas`, ordena por mejor descuento y normaliza el HTML al modelo `Producto`.

Endpoint de prueba local:

```bash
http://localhost:3000/api/connectors/dexter?size=3
```

Endpoint fuente:

```txt
https://www.dexter.com.ar/on/demandware.store/Sites-Dexter-Site/default/Search-UpdateGrid?cgid=hot-sale&q=zapatillas&srule=product-discount&start=0&sz=36
```

## Conectores multi-tienda

`src/lib/connectors/tiendas-externas.ts` agrega conectores reutilizables para tiendas VTEX y Salesforce Commerce Cloud / Demandware. Estas tiendas se integran al catalogo general junto con Moov, Grid, Dexter y los mocks:

- StockCenter
- Open Sports
- Solo Deportes
- Solo Urbano
- SportLine
- DigitalSport
- Dionysos
- SevenSport
- NewSport
- TiendaFuencarral
- Blast
- Dash Deportes
- Sporting
- Mega Sports
- Chelsea
- Sport TOTAL

Endpoint local generico:

```bash
http://localhost:3000/api/connectors/sportline?size=3
http://localhost:3000/api/connectors/stockcenter?size=3
http://localhost:3000/api/connectors/chelsea?size=3
http://localhost:3000/api/connectors/digitalsport?size=3
http://localhost:3000/api/connectors/solodeportes?size=3
```

Tiendas pendientes de integracion manual o investigacion adicional:

- Just For Sport: tiene VTEX, pero el endpoint publico devuelve una pantalla de proteccion/fingerprint en vez de JSON.
