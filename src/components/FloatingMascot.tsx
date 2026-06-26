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
          initial={{ opacity: 0, y: 50, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.5 }}
          whileHover={{ scale: 1.1, rotate: -10 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50 h-20 w-20 flex items-center justify-center filter drop-shadow-[0_8px_8px_rgba(0,0,0,0.25)] transition-all"
          aria-label="Volver arriba"
        >
          <img 
            src="/img/mascota-flecha.png" 
            alt="Volver arriba con Mascota" 
            className="h-full w-full object-contain"
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
