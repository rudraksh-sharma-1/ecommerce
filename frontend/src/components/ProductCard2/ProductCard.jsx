import React from "react";
import {Link} from 'react-router-dom'

const ProductCard = ({ product_id ,id, image, name, old_price, price, rating }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden w-full max-w-[200px] h-[300px] flex flex-col">
      <Link to={`/product/${product_id || id }`}>
      {/* Image Section */}
      <div className="w-full h-[160px] bg-gray-100 flex items-center justify-center">
        <img
          src={image}
          alt={name}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {/* Content Section */}
      <div className="p-3 flex flex-col justify-between flex-grow">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-gray-800 truncate">{name}</h3>
          <p className="text-sm text-gray-600 truncate">{name}</p>
        </div>

        <div className="mt-auto flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {old_price!=0 && old_price ? 
              <span className="line-through text-xs text-gray-500">₹{old_price}</span>
              :
              <></>

            }
            <span className="text-md font-bold text-black">₹{price}</span>
          </div>
          {rating==0 || rating ? 
            <span className="text-sm text-green-600 font-medium">
              ⭐ {rating}
            </span>
            :
            <></>
          }
        </div>
      </div>
      </Link>
    </div>
  );
};

export default ProductCard;
