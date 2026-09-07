"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  sizes: string;
  className?: string;
}

export function ProductImage({
  src,
  alt,
  priority = false,
  sizes,
  className,
}: ProductImageProps) {
  const [falloImagen, setFalloImagen] = useState(false);

  // Normalizar URLs con extensiones duplicadas de VTEX (ej: .jpg.jpg -> .jpg)
  const srcNormalizada = src ? src.replace(/\.jpg\.jpg/gi, ".jpg") : "";

  if (!srcNormalizada || falloImagen) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#edf0e9] px-4 text-center">
        <span className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--color-muted)]">
          Sin imagen
        </span>
        <span className="mt-1 line-clamp-2 text-xs font-bold text-[var(--color-tinta)]">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={srcNormalizada}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      unoptimized={true}
      referrerPolicy="no-referrer"
      className={className}
      onError={() => setFalloImagen(true)}
    />
  );
}
