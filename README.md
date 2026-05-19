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
- `src/types/producto.ts`: modelo principal
