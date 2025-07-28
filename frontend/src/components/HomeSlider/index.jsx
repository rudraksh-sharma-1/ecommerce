import React, { useEffect, useState } from "react";
import { getAllBanners } from '../../utils/supabaseApi';
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "./style.css";

const HomeSlider = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch hero banners from Supabase
  useEffect(() => {
    const fetchHeroBanners = async () => {
      try {
        setLoading(true);
        const result = await getAllBanners();
        if (result.success && Array.isArray(result.banners)) {
          const heroBanners = result.banners.filter(b => b.active && b.position === 'hero' && !b.is_mobile);
          setBanners(heroBanners.map(b => ({
            id: b.id,
            title: b.title,
            description: b.description,
            imageUrl: b.image || b.image_url,
            link: b.link || '#',
          })));
        } else {
          setBanners([]);
        }
      } catch (error) {
        setError('Failed to load banners');
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHeroBanners();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="home-slider rounded-2xl">
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>{error}</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="error-container">
          <p>No banners available.</p>
        </div>
      ) : (
        <>
          <Swiper
            navigation={!isMobile}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            spaceBetween={isMobile ? 16 : 0}
            slidesPerView={isMobile ? 1.2 : 1}
            centeredSlides={isMobile}
            autoplay={banners.length > 1 ? {
              delay: 5000,
              disableOnInteraction: false,
            } : false}
            loop={true}
            modules={[Navigation, Pagination, Autoplay]}
            onSlideChange={(swiper) => setCurrentSlide(swiper.realIndex)}
            className="main-slider"
          >
            {banners.map((banner) => (
              <SwiperSlide key={banner.id}>
                <a href={banner.link} className="slider-link">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className={`slider-image ${isMobile ? 'mobile-slide-image' : 'border-0 rounded-2xl'}`}
                    
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/1200x400?text=Banner+Image+Not+Available';
                    }}
                  />
                  {banner.description && (
                    <div className="banner-caption">
                      <h2>{banner.title}</h2>
                      <p>{banner.description}</p>
                      <button className="banner-btn">Shop Now</button>
                    </div>
                  )}
                </a>
              </SwiperSlide>
            ))}
          </Swiper>
          {banners.length > 0 && (
            <div className="slide-count-btn">{currentSlide + 1}/{banners.length}</div>
          )}
        </>
      )}
    </div>
  );
};

export default HomeSlider;
