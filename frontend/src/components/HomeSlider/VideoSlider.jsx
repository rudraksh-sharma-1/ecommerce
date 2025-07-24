import React, { useEffect, useState, useRef } from "react";
import { getAllVideoBanners } from "../../utils/supabaseApi.js"; // replace with your actual API
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "./style.css";
import VideoWithAutoPlay from "./VideoWithAutoPlay.jsx";

const VideoBannerSlider = () => {
  console.log("VideoBannerSlider mounted");
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
        console.log("Fetched video banners (raw):", result.videoBanners);
        console.log("Full API result:", result);
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

  return (
    <div className="home-slider">
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>{error}</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="error-container">
          <p>No video banners available.</p>
        </div>
      ) : (
        <>
          <Swiper
            navigation={!isMobile}
            pagination={{ clickable: true, dynamicBullets: true }}
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
            className="main-slider"
          >
            {videos.map((banner) => (
              <SwiperSlide key={banner.id}>
                
                  <VideoWithAutoPlay src={banner.videoUrl} />
                
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="slide-count-btn">
            {currentSlide + 1}/{videos.length}
          </div>
        </>
      )}
    </div>
  );
};

export default VideoBannerSlider;
