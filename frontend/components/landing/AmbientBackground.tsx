"use client";

import { useEffect, useRef } from "react";

export default function AmbientBackground() {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const gridHighlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const background = backgroundRef.current;
    const gridHighlight = gridHighlightRef.current;
    if (!background || !gridHighlight) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");
    if (reducedMotion.matches || !finePointer.matches || window.innerWidth <= 720) {
      return;
    }

    let targetX = -1000;
    let targetY = -1000;
    let currentX = targetX;
    let currentY = targetY;
    let animationFrame = 0;

    const animateGrid = () => {
      currentX += (targetX - currentX) * 0.16;
      currentY += (targetY - currentY) * 0.16;
      gridHighlight.style.setProperty("--pointer-x", `${currentX}px`);
      gridHighlight.style.setProperty("--pointer-y", `${currentY}px`);

      if (Math.abs(targetX - currentX) > 0.5 || Math.abs(targetY - currentY) > 0.5) {
        animationFrame = window.requestAnimationFrame(animateGrid);
      } else {
        animationFrame = 0;
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      gridHighlight.style.setProperty("--highlight-opacity", "1");

      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(animateGrid);
      }
    };

    const hideHighlight = () => {
      targetX = -1000;
      targetY = -1000;
      gridHighlight.style.setProperty("--highlight-opacity", "0");

      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(animateGrid);
      }
    };

    const handlePointerOut = (event: PointerEvent) => {
      if (event.relatedTarget === null) hideHighlight();
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerout", handlePointerOut, { passive: true });
    window.addEventListener("blur", hideHighlight);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerout", handlePointerOut);
      window.removeEventListener("blur", hideHighlight);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div ref={backgroundRef} className="ambient-background" aria-hidden="true">
      <div className="ambient-background__wash" />
      <div className="ambient-background__grid" />
      <div ref={gridHighlightRef} className="ambient-background__grid-highlight" />
    </div>
  );
}
