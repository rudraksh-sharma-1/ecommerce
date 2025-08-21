import React, { useEffect, useState } from "react";
import { getAllVideoBanners } from "../../utils/supabaseApi.js";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "./style.css";
import VideoWithAutoPlay from "./VideoWithAutoPlay.jsx";

const VideoBannerSlider = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [videos, setVideos] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideoBanners = async () => {
      try {
        setLoading(true);
        const result = await getAllVideoBanners();
        if (result.success && Array.isArray(result.videoBanners)) {
          const activeVideos = result.videoBanners.filter((b) => b.status);
          setVideos(
            activeVideos.map((video) => ({
              id: video.id,
              name: video.name,
              videoUrl: video.video_url,
            }))
          );
        } else {
          setVideos([]);
        }
      } catch (error) {
        setError("Failed to load video banners");
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoBanners();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if(!isMobile) return null

  return (
    <div className="w-full flex justify-center items-center ">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">
          <p>{error}</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <p>No video banners available.</p>
        </div>
      ) : (
        <div className="w-full bg-white">
          <Swiper
            navigation={!isMobile}
            pagination={{ clickable: true, dynamicBullets: true }}
            spaceBetween={isMobile ? 6 : 0}
            slidesPerView={isMobile ? 1.1 : 1}
            centeredSlides={isMobile}
            autoplay={
              videos.length > 1
                ? {
                    delay: 8000,
                    disableOnInteraction: false,
                  }
                : false
            }
            loop={videos.length > 1}
            modules={[Navigation, Pagination, Autoplay]}
            onSlideChange={(swiper) => setCurrentSlide(swiper.realIndex)}
            className="
              bg-white
              w-full 
              md:w-[90%] 
              mx-auto 
              max-h-[500px] 
              md:max-h-[500px] 
              min-h-[250px]
              overflow-hidden
              border-0 rounded-lg
            "
          >
            {videos.map((banner) => (
              <SwiperSlide key={banner.id}>
                <VideoWithAutoPlay src={banner.videoUrl} />
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="text-center mt-4 text-sm text-gray-600">
            {currentSlide + 1}/{videos.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoBannerSlider;
