"use client";

import { ImagePlus, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usersApi } from "@/lib/api/services/users/users";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

type GalleryProps = {
  userId: string;
  gallery?: string[];
};

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

export function Gallery({ userId, gallery = [] }: GalleryProps) {
  const [items, setItems] = useState<string[]>(gallery);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setItems(gallery);
  }, [gallery]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!userId) return;
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsSaving(true);
    setError(null);

    const previousGallery = items;
    try {
      const dataUrls = await Promise.all(Array.from(files).map(fileToDataUrl));
      const nextGallery = [...items, ...dataUrls];
      setItems(nextGallery);
      const result = await usersApi.update(userId, { gallery: nextGallery });
      if (!result?.success) {
        setItems(previousGallery);
        setError("Failed to save gallery. Please try again.");
      }
    } catch (err) {
      setItems(previousGallery);
      setError("Failed to upload images. Please try again.");
    } finally {
      setIsSaving(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Gallery</CardTitle>
        <CardAction>
          <Button
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={isSaving || !userId}
          >
            {isSaving ? <Loader2 className="animate-spin" /> : <ImagePlus />}
            <span>{isSaving ? "Uploading" : "Upload images"}</span>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {error && <p className="text-destructive mb-3 text-sm">{error}</p>}

        {items.length === 0 ? (
          <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
            No images yet. Upload trainer photos to build the gallery.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((src, index) => (
              <figure key={`${src}-${index}`} className="overflow-hidden rounded-lg border">
                <img className="aspect-video w-full object-cover" src={src} alt="Trainer gallery" loading="lazy" />
              </figure>
            ))}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="sr-only"
        />
      </CardContent>
    </Card>
  );
}
