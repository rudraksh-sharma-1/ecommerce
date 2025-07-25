import React, { useEffect, useRef, useState } from "react";
import "./autoplay.css";

const VideoWithAutoPlay = ({ src }) => {
  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  // Detect if user interacted with the page
  useEffect(() => {
    const handleInteraction = () => setUserInteracted(true);

    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("scroll", handleInteraction, { once: true });

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("scroll", handleInteraction);
    };
  }, []);

  // Observe visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.5,
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

  // Handle play/pause and mute/unmute
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isVisible) {
      video.play().catch((err) => {
        console.warn("Autoplay failed:", err);
      });

      if (userInteracted) {
        video.muted = false; // only unmute after user interacted
      } else {
        video.muted = true;
      }
    } else {
      video.pause();
      video.muted = true;
    }
  }, [isVisible, userInteracted]);

  return (
    <video
      ref={videoRef}
      src={src}
      className=" w-full
    min-h-[250px]
    max-h-[600px]
    object-cover
    md:max-h-[400px]    
    md:w-[90%]           
    mx-auto   "
      style={{
        width: "100%",
        maxHeight: "600px",
        minHeight: "250px",
        objectFit: "cover",
      }}
      loop
      playsInline
      muted // required to let autoplay work at first
      onError={(e) => {
        e.target.onerror = null;
        e.target.poster =
          "https://placehold.co/1200x400?text=Video+Not+Available";
      }}
      controls
    />
  );
};

export default VideoWithAutoPlay;
