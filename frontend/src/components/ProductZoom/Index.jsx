import React, { useState, useEffect } from "react";
import InnerImageZoom from "react-inner-image-zoom";
import "react-inner-image-zoom/lib/InnerImageZoom/styles.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/free-mode";
import "./style.css";

const ProductZoom = ({ media = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const fallbackImage = "https://placehold.co/500x500?text=Product";
  const mediaList = media.length > 0 ? media : [
    { type: "image", src: fallbackImage }
  ];

  const activeMedia = mediaList[activeIndex];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="product-zoom-container">
      {/* Main media display */}
      <div className="mb-4 rounded-lg overflow-hidden w-full aspect-square bg-gray-100 flex items-center justify-center">
        {activeMedia.type === "image" ? (
          <InnerImageZoom
            zoomType="hover"
            zoomScale={1}
            src={activeMedia.src}
            className="w-full h-auto"
            hideHint={true}
            width={500}
            height={500}
            hasSpacer={true}
          />
        ) : (
          <video
            controls
            src={activeMedia.src}
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {/* Thumbnails */}
      <div className="thumbnails-container">
        <Swiper
          spaceBetween={10}
          slidesPerView={isMobile ? 4 : 5}
          freeMode={true}
          watchSlidesProgress={true}
          modules={[FreeMode, Navigation, Thumbs]}
          navigation={true}
          className="product-thumbnails-slider"
        >
          {mediaList.map((item, index) => (
            <SwiperSlide key={index} onClick={() => setActiveIndex(index)}>
              <div className={`thumbnail-item overflow-hidden rounded-md border-2 transition-all cursor-pointer ${activeIndex === index ? 'border-blue-500' : 'border-transparent'}`}>
                {item.type === "image" ? (
                  <img
                    src={item.src}
                    alt={`Product view ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/100x100?text=Image";
                    }}
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <video
                      src={item.src}
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.752 11.168l-5.197-3.027A1 1 0 008 9.027v5.946a1 1 0 001.555.832l5.197-3.027a1 1 0 000-1.73z"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default ProductZoom;
