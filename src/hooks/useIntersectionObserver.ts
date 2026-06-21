"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

export function useIntersectionObserver(
  elementRef: RefObject<Element | null>,
  { threshold = 0, root = null, rootMargin = "0px" }: IntersectionObserverInit = {},
  onChange?: (isIntersecting: boolean) => void
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) return;

    observerRef.current = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      if (onChange) {
        onChange(entry.isIntersecting);
      }
    }, { threshold, root, rootMargin });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [elementRef, threshold, root, rootMargin, onChange]);

  return isIntersecting;
}
