import { NextResponse } from "next/server";

import { obtenerOfertasMoov } from "@/lib/connectors/moov";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start = Number(searchParams.get("start") ?? 0);
  const size = Number(searchParams.get("size") ?? 36);
  const query = searchParams.get("q") ?? "zapatillas";

  try {
    const productos = await obtenerOfertasMoov({
      start: Number.isFinite(start) ? start : 0,
      size: Number.isFinite(size) ? size : 36,
      query,
    });

    return NextResponse.json({
      store: "moov",
      count: productos.length,
      productos,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudieron obtener ofertas de Moov",
      },
      { status: 502 },
    );
  }
}
