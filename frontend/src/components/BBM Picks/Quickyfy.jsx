import React from 'react'
import { useLocation } from "react-router-dom";
import { ChevronRight } from 'lucide-react';

function Quickyfy({ title = "Recommended Store", items = [] }) {
  const location = useLocation();

  // Only show on home route
  if (location.pathname !== "/") {
    return null;
  }

  return (
    <div className="w-full gap-4 p-3 md:hidden">
      {/* Section Title */}
      <h2 className="flex text-sm font-semibold text-gray-900 mb-3">{title} <ChevronRight /></h2>

      {/* Horizontal Scrollable List */}
      <div className="flex overflow-x-auto hide-scrollbar snap-x">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center flex-shrink-0 w-[25%] mr-1 snap-start"
          >
            {/* Card Style Image */}
            <div className="w-full rounded-md overflow-hidden border border-gray-200">
              <img
                src={item.image}
                alt={item.label}
                className="w-full h-full rounded-md object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/100x100?text=Image";
                }}
              />
            </div>
            {/* Label */}
            <p className="mt-1 text-lg text-gray-700 text-center truncate w-full">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Quickyfy
