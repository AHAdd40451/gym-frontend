"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperClass } from "swiper/types";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import Image from "next/image";

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

interface ProductImageGalleryProps {
  images: string[];
}

export default function ProductImageGallery({ images }: ProductImageGalleryProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);

  const productImages = images && images.length > 0 ? images : ["/images/placeholder-product.jpg"];

  return (
    <div className="sticky top-20 space-y-4">
      <Swiper
        style={
          {
            "--swiper-navigation-color": "var(--primary)",
            "--swiper-pagination-color": "var(--primary)"
          } as React.CSSProperties
        }
        loop={productImages.length > 1}
        spaceBetween={10}
        navigation={true}
        thumbs={{ swiper: thumbsSwiper }}
        modules={[FreeMode, Navigation, Thumbs]}
        className="mySwiper2">
        {productImages.map((image, key) => (
          <SwiperSlide key={key}>
            <Image
              src={image}
              className="aspect-3/2 w-full rounded-lg object-contain lg:aspect-square"
              width={300}
              height={300}
              alt="Product"
              unoptimized
            />
          </SwiperSlide>
        ))}
      </Swiper>
      {productImages.length > 1 && (
        <Swiper
          onSwiper={setThumbsSwiper}
          loop={true}
          spaceBetween={10}
          slidesPerView={4}
          freeMode={true}
          watchSlidesProgress={true}
          modules={[FreeMode, Navigation, Thumbs]}
          className="mySwiper mt-2">
          {productImages.map((image, key) => (
            <SwiperSlide key={key} className="group">
              <figure className="group-[.swiper-slide-thumb-active]:border-primary overflow-hidden rounded-lg border opacity-70 group-[.swiper-slide-thumb-active]:opacity-100!">
                <Image
                  className="aspect-square w-full object-contain"
                  src={image}
                  width={300}
                  height={300}
                  alt="Product thumbnail"
                  unoptimized
                />
              </figure>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}