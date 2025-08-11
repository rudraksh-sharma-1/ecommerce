import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// import required modules
import { Navigation, Pagination } from "swiper/modules";
import ProductItem from "../Productitem";
import "./style.css";

const ProductsSlider = ({ 
  title, 
  subtitle, 
  products = [], 
  slidesPerViewMobile = 1.2,
  slidesPerViewTablet = 2.2,
  slidesPerViewDesktop = 4,
  slidesPerViewLarge = 5,
  showNavigation = true,
  showPagination = false
}) => {
  const [isMobile, setIsMobile] = useState(false);

  // Check device size on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Only show real products, do not render placeholders
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="products-slider py-6 !pt-1 sm:py-8">
      {(title || subtitle) && (
        <div className="section-header mb-6 px-4">
          {title && <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{title}</h2>}
          {subtitle && <p className="text-sm sm:text-base text-gray-600 mt-2">{subtitle}</p>}
        </div>
      )}
      
      <div className="relative">
        <Swiper
          slidesPerView={slidesPerViewMobile}
          spaceBetween={6}
          navigation={showNavigation && !isMobile}
          pagination={showPagination ? {
            clickable: true,
            dynamicBullets: true
          } : false}
          modules={[Navigation, Pagination]}
          className="products-swiper px-1"
          breakpoints={{
            640: {
              slidesPerView: slidesPerViewTablet,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: slidesPerViewDesktop,
              spaceBetween: 24,
            },
            1280: {
              slidesPerView: slidesPerViewLarge,
              spaceBetween: 24,
            },
          }}
        >
          {products.map((product, index) => (
            <SwiperSlide key={product?.id || index} className="pb-4">
              <div className="h-full">
                <ProductItem product={product} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default ProductsSlider;
