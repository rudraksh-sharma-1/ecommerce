import React, { useEffect, useRef, useState } from "react";

const VideoWithAutoPlay = ({ src }) => {
  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Detect first user interaction
  useEffect(() => {
    const handleInteraction = () => {
      setUserInteracted(true);
    };

    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("scroll", handleInteraction, { once: true });

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("scroll", handleInteraction);
    };
  }, []);

  // Observe video visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.5 }
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
        video.muted = isMuted;
      } else {
        video.muted = true;
      }
    } else {
      video.pause();
      video.muted = true;
    }
  }, [isVisible, userInteracted, isMuted]);

  // Toggle mute button
  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  };

  return (
    <div style={{ position: "relative" }}>
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
        muted
        onError={(e) => {
          e.target.onerror = null;
          e.target.poster =
            "https://placehold.co/1200x400?text=Video+Not+Available";
        }}
      />

      <button
        onClick={toggleMute}
        style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          background: "rgba(0, 0, 0, 0.5)",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          padding: "6px 10px",
          cursor: "pointer",
        }}
      >
        {isMuted ? "Unmute" : "Mute"}
      </button>
    </div>
  );
};

export default VideoWithAutoPlay;
