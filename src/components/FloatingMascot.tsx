"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function FloatingMascot() {
  const [isVisible, setIsVisible] = useState(false);

  // Mostrar el botón flotante cuando el usuario scrollea 300px hacia abajo
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          onClick={scrollToTop}
          initial={{ opacity: 0, y: 30, scale: 0.6 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.6 }}
          whileHover={{ scale: 1.08, rotate: -5 }}
          whileTap={{ scale: 0.92 }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 h-11 w-11 sm:h-16 sm:w-16 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-md border border-black/15 shadow-[0_6px_20px_rgba(0,0,0,0.15)] transition-all p-1.5 touch-manipulation cursor-pointer"
          aria-label="Volver arriba"
        >
          <img 
            src="/img/mascota-flecha.png" 
            alt="Volver arriba" 
            className="h-full w-full object-contain pointer-events-none"
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
