import React from 'react';
import { Link } from 'react-router-dom';

const BannerBox = ({ img, title, subtitle, link = "/" }) => {
    return (
        <div className="relative overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-all duration-300 h-full group aspect-[16/7]">
            <Link to={link} className="block w-full h-full">
                <img 
                    src={img} 
                    alt={title || "Banner"} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/600x300?text=Banner';
                    }}
                />
                
                {(title || subtitle) && (
                    <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/60 to-transparent text-white">
                        {title && <h3 className="text-lg sm:text-xl font-semibold mb-1">{title}</h3>}
                        {subtitle && <p className="text-sm text-gray-200 mb-2">{subtitle}</p>}
                        <span className="inline-block text-sm font-medium hover:underline">View Details</span>
                    </div>
                )}
            </Link>
        </div>
    );
};

export default BannerBox;