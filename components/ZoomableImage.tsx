"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function ZoomableImage({
  src,
  alt,
  className = "",
  imgClassName = "",
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setZoomed(false);
      }
    }
    document.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  function close() {
    setOpen(false);
    setZoomed(false);
  }

  const modal = open ? (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <button
        type="button"
        onClick={close}
        aria-label="Close"
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white text-2xl leading-none flex items-center justify-center backdrop-blur-sm z-10 transition-colors"
      >
        ×
      </button>

      <div
        className="w-full h-full overflow-auto flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          onClick={() => setZoomed((z) => !z)}
          className={
            zoomed
              ? "max-w-none max-h-none w-auto h-auto cursor-zoom-out select-none"
              : "max-w-full max-h-full object-contain cursor-zoom-in select-none"
          }
          draggable={false}
        />
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`block focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg ${className}`}
        aria-label={`View ${alt} fullscreen`}
      >
        <img
          src={src}
          alt={alt}
          className={`${imgClassName} cursor-zoom-in`}
          loading="lazy"
          draggable={false}
        />
      </button>

      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
