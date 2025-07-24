import React, { useEffect, useRef, useState } from "react";

const VideoWithAutoPlay = ({ src }) => {
  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.5, // at least 50% of video should be visible
      }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      if (isVisible) {
        video.muted = false;
        video.play().catch((err) => console.warn("Autoplay failed:", err));
      } else {
        video.pause();
        video.muted = true;
      }
    }
  }, [isVisible]);

  return (
    <video
      ref={videoRef}
      src={src}
      className="slider-image"
      style={{
        width: "100%",
        maxHeight: "600px",
        minHeight: "250px",
        objectFit: "cover",
      }}
      loop
      playsInline
      muted // initially muted to satisfy autoplay policy
      onError={(e) => {
        e.target.onerror = null;
        e.target.poster =
          "https://placehold.co/1200x400?text=Video+Not+Available";
      }}
    />
  );
};

export default VideoWithAutoPlay;
