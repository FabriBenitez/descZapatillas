"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

export function useIntersectionObserver(
  elementRef: RefObject<Element | null>,
  options: IntersectionObserverInit = { threshold: 0, rootMargin: "0px" }
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) return;

    observerRef.current = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [elementRef, options.rootMargin, options.threshold]);

  return isIntersecting;
}
