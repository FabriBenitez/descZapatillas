import { NextResponse } from "next/server";

import { obtenerOfertasGrid } from "@/lib/connectors/grid";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = Number(searchParams.get("from") ?? 0);
  const size = Number(searchParams.get("size") ?? 50);
  const query = searchParams.get("q") ?? "zapatillas";

  try {
    const productos = await obtenerOfertasGrid({
      from: Number.isFinite(from) ? from : 0,
      size: Number.isFinite(size) ? size : 50,
      query,
    });

    return NextResponse.json({
      store: "grid",
      count: productos.length,
      productos,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudieron obtener ofertas de Grid",
      },
      { status: 502 },
    );
  }
}
