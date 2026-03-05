"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";

export function DrawerProfileGallery({ gallery = [] }: { gallery?: string[] }) {
  const items = gallery.filter(Boolean);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  const open = currentIndex !== null;
  const currentSrc =
    open && items[currentIndex] != null ? items[currentIndex] : null;
  const hasPrev = open && currentIndex > 0;
  const hasNext = open && currentIndex < items.length - 1;

  const openAt = (index: number) => setCurrentIndex(index);
  const close = () => setCurrentIndex(null);
  const goPrev = () =>
    setCurrentIndex((i) => (i != null && i > 0 ? i - 1 : i));
  const goNext = () =>
    setCurrentIndex((i) =>
      i != null && i < items.length - 1 ? i + 1 : i
    );

  useEffect(() => {
    if (!open || items.length <= 1) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goPrev();
      } else if (e.key === "ArrowRight") {
        goNext();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, currentIndex, items.length]);

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ImageIcon className="size-4" />
            Gallery
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
              No images in gallery yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {items.map((src, index) => (
                <button
                  type="button"
                  key={`${index}-${src.slice(0, 30)}`}
                  onClick={() => openAt(index)}
                  className="group overflow-hidden rounded-lg border bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <img
                    className="aspect-square w-full object-cover transition-transform duration-200 group-hover:scale-110"
                    src={src}
                    alt=""
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && close()}>
        <DialogContent className="max-w-[95vw] w-auto border-0 bg-black/95 p-0 [&>button]:absolute [&>button]:right-2 [&>button]:top-2 [&>button]:z-10 [&>button]:text-white [&>button]:hover:bg-white/20">
          <div className="relative flex items-center justify-center py-12">
            {currentSrc && (
              <img
                src={currentSrc}
                alt="Gallery full size"
                className="max-h-[90vh] max-w-full object-contain"
              />
            )}

            {items.length > 1 && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={goPrev}
                  disabled={!hasPrev}
                  className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white disabled:pointer-events-none disabled:opacity-30"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="size-8" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={goNext}
                  disabled={!hasNext}
                  className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white disabled:pointer-events-none disabled:opacity-30"
                  aria-label="Next image"
                >
                  <ChevronRight className="size-8" />
                </Button>
              </>
            )}

            {items.length > 1 && (
              <p className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
                {currentIndex != null ? currentIndex + 1 : 0} / {items.length}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
