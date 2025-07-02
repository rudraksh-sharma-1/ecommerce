import React, { useState, useEffect, useRef } from "react";
import InnerImageZoom from "react-inner-image-zoom";
import "react-inner-image-zoom/lib/InnerImageZoom/styles.css";
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/free-mode";
import "./style.css";

// Import required modules
import { Navigation, Thumbs, FreeMode } from "swiper/modules";

const ProductZoom = ({ images }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Default images if none are provided
  const defaultImages = [
    "https://m.media-amazon.com/images/I/71agZnsk6IL._AC_UF894,1000_QL80_.jpg",
    "https://m.media-amazon.com/images/I/71FegSuP91L._AC_UF894,1000_QL80_.jpg",
    "https://m.media-amazon.com/images/I/71KZttLFJXL._AC_UF894,1000_QL80_.jpg",
    "https://m.media-amazon.com/images/I/71+motR9GXL._AC_UF894,1000_QL80_.jpg"
  ];
  
  const productImages = images || defaultImages;
  
  // Check for mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="product-zoom-container">
      {/* Main product image with zoom */}
      <div className="mb-4">
        <InnerImageZoom
          zoomType="hover"
          zoomScale={1}
          src={productImages[activeIndex]}
          className="w-full h-auto rounded-lg overflow-hidden"
          hideHint={true}
          width={500}
          height={500}
          hasSpacer={true}
        />
      </div>
      
      {/* Thumbnail slider */}
      <div className="thumbnails-container">
        <Swiper
          onSwiper={setThumbsSwiper}
          spaceBetween={10}
          slidesPerView={isMobile ? 4 : 5}
          freeMode={true}
          watchSlidesProgress={true}
          modules={[FreeMode, Navigation, Thumbs]}
          direction={isMobile ? 'horizontal' : 'horizontal'}
          className="product-thumbnails-slider"
          navigation={true}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        >
          {productImages.map((image, index) => (
            <SwiperSlide key={index} onClick={() => setActiveIndex(index)}>
              <div className={`thumbnail-item overflow-hidden rounded-md border-2 transition-all cursor-pointer ${activeIndex === index ? 'border-blue-500' : 'border-transparent'}`}>
                <img
                  src={image}
                  alt={`Product view ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/100x100?text=Image';
                  }}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default ProductZoom;