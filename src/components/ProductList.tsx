"use client";

import { useRef, useState, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import { ProductCard } from "@/components/ProductCard";
import type { Producto } from "@/types/producto";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

interface ProductListProps {
  titulo?: string;
  descripcion?: string;
  productos: Producto[];
  mensajeVacio?: string;
  cantidadPrioritaria?: number;
  vista?: "grid" | "lista";
  cargando?: boolean;
}

function SkeletonGrid({ vista = "grid" }: { vista?: "grid" | "lista" }) {
  return (
    <div
      className={
        vista === "lista"
          ? "grid gap-3"
          : "grid grid-cols-2 gap-x-2.5 gap-y-4 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4"
      }
    >
      {Array.from({ length: vista === "lista" ? 4 : 6 }).map((_, indice) => (
        <div
          key={indice}
          className={`overflow-hidden rounded-[8px] border-2 border-[#111] bg-white ${
            vista === "lista" ? "grid sm:grid-cols-[220px_minmax(0,1fr)]" : ""
          }`}
        >
          <div
            className={`skeleton bg-[#f9f9f9] border-b-2 border-[#111] ${
              vista === "lista" ? "h-52 sm:h-auto sm:border-b-0 sm:border-r-2" : "aspect-square"
            }`}
          />
          <div className="space-y-3 p-3 sm:p-5">
            <div className="skeleton h-4 w-20 rounded-[4px] bg-[#f0f3f1]" />
            <div className="skeleton h-5 w-4/5 rounded-[4px] bg-[#f0f3f1] sm:h-6" />
            <div className="skeleton h-7 w-2/3 rounded-[4px] bg-[#f0f3f1] sm:h-8" />
            <div className="hidden grid-cols-2 gap-2 sm:grid">
              <div className="skeleton h-14 rounded-[4px] bg-[#f0f3f1]" />
              <div className="skeleton h-14 rounded-[4px] bg-[#f0f3f1]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const ITEMS_PER_PAGE = 48;

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 120, damping: 15 },
  },
};

export function ProductList({
  titulo,
  descripcion,
  productos,
  mensajeVacio = "No encontramos productos para esa combinación de búsqueda y filtros.",
  cantidadPrioritaria = 0,
  vista = "grid",
  cargando = false,
}: ProductListProps) {
  const [limite, setLimite] = useState(ITEMS_PER_PAGE);
  const [prevProductos, setPrevProductos] = useState(productos);
  const [mostrarSubir, setMostrarSubir] = useState(false);

  if (productos !== prevProductos) {
    setPrevProductos(productos);
    setLimite(ITEMS_PER_PAGE);
  }

  useEffect(() => {
    const handleScroll = () => {
      setMostrarSubir(window.scrollY > 900);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const triggerRef = useRef<HTMLDivElement>(null);

  useIntersectionObserver(
    triggerRef,
    { rootMargin: "600px" },
    (isIntersecting) => {
      if (isIntersecting) {
        setLimite((prev) => (prev < productos.length ? prev + ITEMS_PER_PAGE : prev));
      }
    }
  );

  const productosVisibles = productos.slice(0, limite);
  const tieneMas = limite < productos.length;

  return (
    <section className="lista-productos flex flex-col gap-5 sm:gap-6 relative">
      {titulo || descripcion ? (
        <div className="seccion-cabecera border-2 border-[#111] bg-[#FF4500] p-4 sm:p-6 text-white shadow-[4px_4px_0px_#111] sm:shadow-[6px_6px_0px_#111]">
          {titulo ? <h2 className="text-xl sm:text-4xl font-black uppercase tracking-tighter mb-1 sm:mb-2">{titulo}</h2> : null}
          {descripcion ? (
            <p className="max-w-3xl text-xs sm:text-sm font-bold uppercase tracking-widest text-white/90">
              {descripcion}
            </p>
          ) : null}
        </div>
      ) : null}

      {cargando ? (
        <div className="flex flex-col items-center justify-center space-y-6 py-12">
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="h-28 w-28 sm:h-32 sm:w-32"
          >
            <img src="/img/mascota-buscando.png" alt="Buscando ofertas..." className="h-full w-full object-contain" />
          </motion.div>
          <p className="text-base sm:text-lg font-black uppercase tracking-widest text-[#111]">Buscando las mejores ofertas...</p>
          <div className="w-full opacity-50 mt-6">
            <SkeletonGrid vista={vista} />
          </div>
        </div>
      ) : productos.length > 0 ? (
        <>
          <div
            className={
              vista === "lista"
                ? "grid gap-3.5 sm:gap-4"
                : "grid grid-cols-2 gap-x-2.5 gap-y-3.5 sm:gap-x-3 sm:gap-y-6 lg:grid-cols-3 xl:grid-cols-4"
            }
          >
            {(() => {
              const maxDescuento = Math.max(...productosVisibles.map((p) => p.discount));
              const idMejorOferta = maxDescuento > 40 
                ? productosVisibles.find(p => p.discount === maxDescuento)?.id 
                : null;

              return productosVisibles.map((producto, indice) => (
                <motion.div
                  key={producto.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className={producto.id === idMejorOferta ? "relative z-10" : ""}
                >
                  <ProductCard
                    producto={producto}
                    prioridadImagen={indice < cantidadPrioritaria}
                    vista={vista}
                    esMejorOferta={producto.id === idMejorOferta}
                  />
                </motion.div>
              ));
            })()}
          </div>
          
          {tieneMas && (
            <div ref={triggerRef} className="mt-6 flex w-full flex-col items-center justify-center py-6">
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="h-12 w-12"
              >
                <img src="/img/mascota-buscando.png" alt="Cargando más..." className="h-full w-full object-contain" />
              </motion.div>
            </div>
          )}

          {mostrarSubir && (
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="fixed bottom-5 right-4 z-40 flex items-center gap-1.5 rounded-full border-2 border-[#111] bg-[#fbbf24] px-3.5 py-2.5 text-xs font-black uppercase tracking-wider text-[#111] shadow-[3px_3px_0px_#111] active:translate-y-0.5 transition-all"
              aria-label="Volver arriba"
            >
              <span>↑ Subir</span>
            </button>
          )}
        </>
      ) : (
        <article className="estado-vacio flex flex-col items-center justify-center p-8 sm:p-12 text-center border-2 border-[#111] bg-white shadow-[6px_6px_0px_#111] rounded-[8px]">
          <div className="h-32 w-32 sm:h-40 sm:w-40 mb-5">
            <img src="/img/mascota-triste.png" alt="Sin resultados" className="h-full w-full object-contain grayscale-[0.2]" />
          </div>
          <p className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-[#111]">
            Sin resultados por ahora
          </p>
          <p className="mx-auto mt-3 max-w-md text-xs sm:text-sm font-bold uppercase tracking-widest text-black/50">
            {mensajeVacio}
          </p>
        </article>
      )}
    </section>
  );
}
