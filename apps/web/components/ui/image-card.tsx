"use client";

import { useState } from "react";
import { X, ZoomIn } from "lucide-react";

interface ImageCardProps {
  src: string;
  alt: string;
  caption?: string;
  aspectRatio?: "square" | "video" | "wide" | "portrait";
}

export default function ImageCard({
  src,
  alt,
  caption,
  aspectRatio = "video",
}: ImageCardProps) {
  const [lightbox, setLightbox] = useState(false);

  const aspectClass = {
    square: "aspect-square",
    video: "aspect-video",
    wide: "aspect-[21/9]",
    portrait: "aspect-[3/4]",
  }[aspectRatio];

  return (
    <>
      <figure className="group relative bg-card border border-border rounded-2xl overflow-hidden cursor-pointer">
        <div className={`relative w-full ${aspectClass}`} onClick={() => setLightbox(true)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-background/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
              <ZoomIn size={18} className="text-foreground" />
            </div>
          </div>
        </div>
        {caption && (
          <figcaption className="px-4 py-3 font-body text-xs text-muted-foreground">
            {caption}
          </figcaption>
        )}
      </figure>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X size={18} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
