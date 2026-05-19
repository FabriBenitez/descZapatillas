import { NextResponse } from "next/server";

import {
  obtenerOfertasTiendaExterna,
  obtenerTiendaExterna,
} from "@/lib/connectors/tiendas-externas";

interface RouteContext {
  params: Promise<{
    store: string;
  }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { store } = await context.params;
  const tienda = obtenerTiendaExterna(store);

  if (!tienda) {
    return NextResponse.json(
      {
        error: `No hay conector configurado para ${store}`,
      },
      { status: 404 },
    );
  }

  const { searchParams } = new URL(request.url);
  const size = Number(searchParams.get("size") ?? 24);
  const pagina = Number(searchParams.get("page") ?? 0);
  const query = searchParams.get("q") ?? "zapatillas";

  try {
    const productos = await obtenerOfertasTiendaExterna(tienda, {
      size: Number.isFinite(size) ? size : 24,
      pagina: Number.isFinite(pagina) ? pagina : 0,
      query,
    });

    return NextResponse.json({
      store: tienda.slug,
      storeName: tienda.nombre,
      count: productos.length,
      productos,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : `No se pudieron obtener ofertas de ${tienda.nombre}`,
      },
      { status: 502 },
    );
  }
}
