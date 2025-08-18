import React, { useState } from "react";
import { Link } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext"; 
import { addToCart } from "../../utils/supabaseApi"; 

const ProductCard = ({ product_id, id, image, second_preview_image, name, old_price, price, rating, uom }) => {
  const [cartLoading, setCartLoading] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const { currentUser } = useAuth();

  // If not last section, don't render

  // Fallback image logic
  const displayImage = second_preview_image || image;

  const handleAddToCart = async () => {
    if (!currentUser) {
      alert("Please login to add items to cart.");
      return;
    }

    const actualProductId = product_id || id;
    if (!actualProductId) return;

    setCartLoading(true);
    try {
      const { success } = await addToCart(currentUser.id, actualProductId, 1);
      setCartLoading(false);
      if (success) {
        setCartAdded(true);
        window.dispatchEvent(new Event('cartUpdated'));
        setTimeout(() => setCartAdded(false), 1200);
      }
    } catch (err) {
      setCartLoading(false);
    }
  };

  return (
    <div className="relative bg-white rounded-lg shadow-md overflow-hidden w-full max-w-[140px] h-[210px] flex flex-col">
      <Link to={`/product/${product_id || id}`}>
        <div className="w-full h-[140px] bg-gray-300 flex items-center justify-center overflow-hidden">
          <img
            src={displayImage}
            alt={name}
            className="h-[140px] w-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/100x100?text=Image';
            }}
          />
          {/* Optional Add to Cart Button */}
        </div>

        <div className="p-3 flex flex-col justify-between flex-grow">

          <div className="mt-auto flex flex-col gap-1">
            <div className="flex items-center gap-2">
              {old_price != 0 && old_price &&
                <span className="line-through text-[10px] text-gray-500">₹{old_price}</span>
              }
              <span className="text-[10px] font-bold text-black truncate">₹{price}</span>
            </div>
          </div>
              
          {uom ? <div className="flex flex-col gap-1">
            <p className="text-[10px] text-gray-600 lineclamp">{uom}</p>
          </div>: <div className="flex flex-col gap-1">
            <p className="text-[10px] text-gray-600 lineclamp">1 Variant</p>
          </div> }

          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-bold text-gray-600 truncate-2 ">{name}</p>
          </div>
        </div>
      </Link>
      <button
        onClick={handleAddToCart}
        disabled={cartLoading || !currentUser}
        style={{ minHeight: 27 }}
        className={`absolute bottom-17.5 right-0 border-2 rounded-md  bg-white w-[40px] !h-5 text-center text-black text-sm font-bold ${
          cartAdded ? 'text-green-400' : 'text-pink-500'
        }`}
      >
        {cartAdded ? "✔" : "ADD"}
      </button>

      
    </div>
  );
};

export default ProductCard;
