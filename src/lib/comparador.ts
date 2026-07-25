import { filtrosIniciales, type FiltrosProductos, type OrdenProductos, type Producto } from "@/types/producto";
import { calcularMejorPrecioHistorico, normalizarTexto } from "@/lib/formato";

export interface OpcionesFiltros {
  marcas: string[];
  tiendas: string[];
  talles: string[];
  generos: string[];
  categorias: string[];
  subcategorias: string[];
  colores: string[];
  tiposOferta: string[];
}

function ordenarTexto(valores: string[]) {
  return [...valores].sort((valorA, valorB) =>
    valorA.localeCompare(valorB, "es"),
  );
}

function normalizarBusquedaConAlias(valor: string) {
  return normalizarTexto(valor)
    .replace(/\bdesxter\b/g, "dexter")
    .replace(/\bdexterr\b/g, "dexter")
    .replace(/\bninos\b/g, "nino")
    .replace(/\bninas\b/g, "nina");
}

function ordenarTalles(valores: string[]) {
  return [...valores].sort((a, b) => {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return a.localeCompare(b, "es");
  });
}

export function obtenerOpcionesFiltros(productos: Producto[]): OpcionesFiltros {
  return {
    marcas: ordenarTexto(
      Array.from(new Set(productos.map((producto) => producto.brand).filter((val): val is string => !!val))),
    ),
    tiendas: ordenarTexto(
      Array.from(
        new Set(
          productos
            .map((producto) => producto.storeName)
            .filter((tienda): tienda is string => !!tienda),
        ),
      ),
    ),
    talles: ordenarTalles(
      Array.from(
        new Set(
          productos.flatMap((producto) => producto.sizes ?? [producto.size ?? ""]),
        ),
      ).filter(Boolean),
    ),
    generos: ordenarTexto(
      Array.from(new Set(productos.map((producto) => producto.gender).filter((val): val is string => !!val))),
    ),
    categorias: ordenarTexto(
      Array.from(
        new Set(
          productos
            .map((producto) => producto.category)
            .filter((cat): cat is string => !!cat),
        ),
      ),
    ),
    colores: ordenarTexto(
      Array.from(new Set(productos.map((producto) => producto.color).filter(Boolean))),
    ),
    subcategorias: ordenarTexto(
      Array.from(
        new Set(
          productos
            .map((producto) => (producto as { subcategory?: string | null }).subcategory)
            .filter((s): s is string => !!s),
        ),
      ),
    ),
    tiposOferta: ordenarTexto(
      Array.from(
        new Set(
          productos.flatMap((producto) =>
            producto.offerType ? [producto.offerType] : [],
          ),
        ),
      ),
    ),
  };
}

export function hayFiltrosActivos(filtros: FiltrosProductos) {
  return JSON.stringify(filtros) !== JSON.stringify(filtrosIniciales);
}

function coincideUltimaActualizacion(
  producto: Producto,
  ultimaActualizacion: string,
) {
  if (!ultimaActualizacion) {
    return true;
  }

  const horasLimite = {
    "24h": 24,
    "72h": 72,
    "168h": 168,
  }[ultimaActualizacion];

  if (!horasLimite) {
    return true;
  }

  const diferenciaHoras =
    (Date.now() - new Date(producto.updatedAt).getTime()) / (1000 * 60 * 60);

  return diferenciaHoras <= horasLimite;
}

export function filtrarProductos(
  productos: Producto[],
  terminoBusqueda: string,
  filtros: FiltrosProductos,
) {
  const terminoConAlias = normalizarBusquedaConAlias(terminoBusqueda);
  const palabrasBusqueda = terminoConAlias
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p.replace(/[^a-z0-9]/g, ""))
    .filter(Boolean);

  const parsearMonto = (valor: string | number | undefined) => {
    if (!valor) return 0;
    const stringLimpio = String(valor).replace(/[^0-9.,]/g, "");
    const conPunto = stringLimpio.replace(/\./g, "").replace(/,/g, ".");
    return Number(conPunto) || 0;
  };

  const precioMinimo = parsearMonto(filtros.precioMinimo);
  const precioMaximo = parsearMonto(filtros.precioMaximo);
  
  // Los descuentos están guardados como enteros (ej. 30 = 30% de descuento)
  const descuentoMinimo = Number(filtros.descuentoMinimo || 0);

  return productos.filter((producto) => {
    if (palabrasBusqueda.length > 0) {
      const textoProductoNormalizado = normalizarTexto([
        producto.name,
        producto.brand,
        producto.storeName,
        producto.storeSlug,
        producto.gender,
        producto.category,
        producto.color
      ].join(" ")).replace(/[^a-z0-9]/g, "");

      const coincideTodo = palabrasBusqueda.every((palabra) =>
        textoProductoNormalizado.includes(palabra)
      );

      if (!coincideTodo) {
        return false;
      }
    }

    if (filtros.marca && producto.brand !== filtros.marca) {
      return false;
    }

    if (filtros.tienda && producto.storeName !== filtros.tienda) {
      return false;
    }

    if (precioMinimo && producto.price < precioMinimo) {
      return false;
    }

    if (precioMaximo && producto.price > precioMaximo) {
      return false;
    }

    if (filtros.talle) {
      const tallesDisponibles = producto.sizes ?? [producto.size ?? ""];

      if (!tallesDisponibles.includes(filtros.talle)) {
        return false;
      }
    }

    if (filtros.genero && producto.gender !== filtros.genero) {
      return false;
    }

    if (filtros.categoria) {
      const catFiltro = normalizarTexto(filtros.categoria);
      const catProd = normalizarTexto(producto.category ?? "");
      if (!catProd.includes(catFiltro)) return false;
    }

    if ((filtros as { subcategoria?: string }).subcategoria) {
      const subFiltro = normalizarTexto((filtros as { subcategoria?: string }).subcategoria ?? "");
      const subProd = normalizarTexto((producto as { subcategory?: string | null }).subcategory ?? "");
      if (!subProd.includes(subFiltro)) return false;
    }

    if (filtros.color) {
      // Búsqueda parcial normalizada: "Negro" matchea "Negro/Blanco", "Negro Mate", etc.
      const colorFiltro = normalizarTexto(filtros.color);
      const colorProd = normalizarTexto(producto.color ?? "");
      if (!colorProd.includes(colorFiltro)) return false;
    }

    if (descuentoMinimo && producto.discount < descuentoMinimo) {
      return false;
    }

    if (filtros.soloStock && !producto.available) {
      return false;
    }

    if (filtros.tipoOferta && producto.offerType !== filtros.tipoOferta) {
      return false;
    }

    if (filtros.envioGratis && !producto.freeShipping) {
      return false;
    }

    return coincideUltimaActualizacion(producto, filtros.ultimaActualizacion);
  });
}

export function ordenarProductos(
  productos: Producto[],
  ordenSeleccionado: OrdenProductos,
) {
  const productosOrdenados = [...productos];

  productosOrdenados.sort((productoA, productoB) => {
    switch (ordenSeleccionado) {
      case "precio-asc":
        return productoA.price - productoB.price;
      case "precio-desc":
        return productoB.price - productoA.price;
      case "descuento-desc":
        return productoB.discount - productoA.discount;
      case "descuento-asc":
        return productoA.discount - productoB.discount;
      case "historico":
        return (
          calcularMejorPrecioHistorico(productoA) -
          calcularMejorPrecioHistorico(productoB)
        );
      case "recientes":
      default:
        return (
          new Date(productoB.updatedAt).getTime() -
          new Date(productoA.updatedAt).getTime()
        );
    }
  });

  return productosOrdenados;
}

export function obtenerProductosDestacados(productos: Producto[], cantidad = 4) {
  return ordenarProductos(productos, "descuento-desc").slice(0, cantidad);
}

function contarCoincidenciasModelo(productoBase: Producto, candidato: Producto) {
  const nombreBase = productoBase?.normalizedName || (productoBase?.name ? normalizarTexto(productoBase.name) : "");
  const nombreCandidato = candidato?.normalizedName || (candidato?.name ? normalizarTexto(candidato.name) : "");

  const palabrasBase = new Set(nombreBase.split(" "));
  const palabrasCandidatas = nombreCandidato.split(" ");

  return palabrasCandidatas.filter((palabra) => palabrasBase.has(palabra)).length;
}

export function calcularProductosSimilares(
  productoBase: Producto,
  productos: Producto[],
  cantidad = 4,
) {
  return productos
    .filter((producto) => producto.id !== productoBase.id)
    .map((producto) => {
      let puntaje = 0;

      if (producto.brand === productoBase.brand) {
        puntaje += 4;
      }

      if (producto.category === productoBase.category) {
        puntaje += 3;
      }

      if (producto.storeName === productoBase.storeName) {
        puntaje += 1;
      }

      if (Math.abs(producto.price - productoBase.price) <= 35000) {
        puntaje += 2;
      }

      if (producto.gender === productoBase.gender) {
        puntaje += 1;
      }

      puntaje += Math.min(contarCoincidenciasModelo(productoBase, producto), 3);

      return { producto, puntaje };
    })
    .sort((productoA, productoB) => productoB.puntaje - productoA.puntaje)
    .slice(0, cantidad)
    .map((resultado) => resultado.producto);
}
