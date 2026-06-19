"use client";

import { useRef, useState } from "react";
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
          : "grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4"
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
              vista === "lista" ? "h-52 sm:h-auto sm:border-b-0 sm:border-r-2" : "aspect-[4/3] sm:aspect-square"
            }`}
          />
          <div className="space-y-3 p-4 sm:p-5">
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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
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
  mensajeVacio = "No encontramos productos para esa combinacion de busqueda y filtros.",
  cantidadPrioritaria = 0,
  vista = "grid",
  cargando = false,
}: ProductListProps) {
  const [limite, setLimite] = useState(ITEMS_PER_PAGE);
  const [prevProductos, setPrevProductos] = useState(productos);
  
  // Render-phase state update to avoid cascading renders
  if (productos !== prevProductos) {
    setPrevProductos(productos);
    setLimite(ITEMS_PER_PAGE);
  }

  const triggerRef = useRef<HTMLDivElement>(null);
  
  // Usamos el callback onChange para evitar useEffect
  useIntersectionObserver(
    triggerRef, 
    { rootMargin: "2500px" },
    (isIntersecting) => {
      if (isIntersecting) {
        setLimite((prev) => (prev < productos.length ? prev + ITEMS_PER_PAGE : prev));
      }
    }
  );

  const productosVisibles = productos.slice(0, limite);
  const tieneMas = limite < productos.length;

  return (
    <section className="lista-productos flex flex-col gap-6">
      {titulo || descripcion ? (
        <div className="seccion-cabecera border-2 border-[#111] bg-[#FF4500] p-6 text-white shadow-[6px_6px_0px_#111]">
          {titulo ? <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter mb-2">{titulo}</h2> : null}
          {descripcion ? (
            <p className="max-w-3xl text-sm font-bold uppercase tracking-widest text-white/90">
              {descripcion}
            </p>
          ) : null}
        </div>
      ) : null}

      {cargando ? (
        <SkeletonGrid vista={vista} />
      ) : productos.length > 0 ? (
        <>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "100px" }}
            className={
              vista === "lista"
                ? "grid gap-4"
                : "grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"
            }
          >
            {productosVisibles.map((producto, indice) => (
              <motion.div key={producto.id} variants={itemVariants}>
                <ProductCard
                  producto={producto}
                  prioridadImagen={indice < cantidadPrioritaria}
                  vista={vista}
                />
              </motion.div>
            ))}
          </motion.div>
          
          {tieneMas && (
            <div ref={triggerRef} className="mt-8 flex w-full items-center justify-center py-6">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-solid border-[#111] border-r-transparent"></div>
            </div>
          )}
        </>
      ) : (
        <article className="estado-vacio p-10 text-center border-2 border-[#111] bg-white shadow-[8px_8px_0px_#111]">
          <p className="text-3xl font-black uppercase tracking-tighter text-[#111]">
            Sin resultados por ahora
          </p>
          <p className="mx-auto mt-4 max-w-md text-sm font-bold uppercase tracking-widest text-black/50">
            {mensajeVacio}
          </p>
        </article>
      )}
    </section>
  );
}
