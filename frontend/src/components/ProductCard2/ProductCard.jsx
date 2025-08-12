import React, { useState } from "react";
import { Link } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext"; // adjust path if needed
import { addToCart } from "../../utils/supabaseApi"; // adjust path if needed

const ProductCard = ({ product_id, id, image, name, old_price, price, rating }) => {
  const [cartLoading, setCartLoading] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const { currentUser } = useAuth();

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
    <div className="relative bg-white rounded-lg shadow-md overflow-hidden w-full max-w-[140px] h-[200px] flex flex-col">
      <Link to={`/product/${product_id || id}`}>
        <div className="w-full h-[140px] bg-gray-300 flex items-center justify-center overflow-hidden">
          <img
            src={image}
            alt={name}
            className="h-[140px] w-full object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/100x100?text=Image';
            }}
          />
        </div>

        <div className="p-3 flex flex-col justify-between flex-grow">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-gray-600 truncate">{name}</p>
          </div>

          <div className="mt-auto flex flex-col gap-1">
            <div className="flex items-center gap-2">
              {old_price != 0 && old_price &&
                <span className="line-through text-xs text-gray-500">₹{old_price}</span>
              }
              <span className="text-md font-bold text-black truncate">₹{price}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Add to Cart Button */}
      {/* <button
        onClick={handleAddToCart}
        disabled={cartLoading || !currentUser}
        className={`absolute bottom-1 left-1 rounded-full text-black text-xs font-bold flex items-center justify-center ${
          cartAdded ? 'text-green-400' : 'text-black'
        }`}
      >
        {cartAdded ? "✔" : "Add to Cart"}
      </button> */}
    </div>
  );
};

export default ProductCard;
