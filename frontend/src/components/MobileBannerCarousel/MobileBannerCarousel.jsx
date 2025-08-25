import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useLocation } from "react-router-dom";
import { getAllBanners } from '../../utils/supabaseApi.js';

const MobileBannerCarousel = () => {
  const { pathname } = useLocation();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  // Fetch banners on mount
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const result = await getAllBanners();
        if (result.success && Array.isArray(result.banners)) {
          const heroBanners = result.banners.filter(b => b.active && b.position === 'hero' && b.is_mobile);
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
        setError("Failed to load banners");
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  if (pathname !== "/" || banners.length === 0 || loading || error) return null;

  return (
    <div className="block md:hidden mt-2 mx-1">
      <div className="overflow-hidden rounded-xl shadow-lg" ref={emblaRef}>
        <div className="flex">
          {banners.map((banner, index) => (
            <a
              key={banner.id || index}
              href={banner.link}
              className="min-w-0 flex-[0_0_100%]"
            >
              <img
                src={banner.imageUrl}
                alt={banner.title || `Slide ${index + 1}`}
                className="w-full h-[150px] object-cover object-center rounded-xl"

                onError={(e) => {
                  e.target.src = "https://placehold.co/600x200?text=No+Image";
                }}
              />
            </a>
          ))}
        </div>
      </div>

      {/* Pagination Dots */}
      {/* <div className="flex justify-center mt-2 space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full ${
              selectedIndex === index ? "bg-black" : "bg-gray-400"
            }`}
            onClick={() => emblaApi && emblaApi.scrollTo(index)}
          />
        ))}
      </div> */}
    </div>
  );
};

export default MobileBannerCarousel;
