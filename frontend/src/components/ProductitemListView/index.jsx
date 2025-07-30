import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Rating from "@mui/material/Rating";
import { styled } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Button from "@mui/material/Button";
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityIcon from '@mui/icons-material/Visibility';
// import CompareArrowsIcon from '@mui/icons-material/CompareArrows'; // Removed compare feature
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useState, useEffect } from "react";
import { useAuth } from '../../contexts/AuthContext';
import { getWishlistItems, addToWishlist, removeFromWishlist, addToCart } from '../../utils/supabaseApi';

// Styled icon button for consistent appearance and touch targets
const StyledIconButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'white',
  color: '#666',
  '&:hover': {
    backgroundColor: '#3f51b5',
    color: 'white',
  },
  '&:disabled': {
    backgroundColor: '#f5f5f5',
    color: '#ccc',
  },
  width: '40px',
  height: '40px',
  boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
  margin: '0 4px',
  '@media (max-width: 640px)': {
    width: '36px',
    height: '36px',
  },
}));


const ProductItem = ({ product }) => {
  const [cartLoading, setCartLoading] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const { currentUser } = useAuth();
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState(null);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle quick view - navigate to product page
  const handleQuickView = () => {
    if (product && product.id) {
      navigate(`/product/${product.id}`);
    }
  };



  useEffect(() => {
    async function checkWishlist() {
      try {
        if (currentUser && currentUser.id && product && product.id) {
          const { success, wishlistItems, error } = await getWishlistItems(currentUser.id);
          if (success && wishlistItems) {
            const found = wishlistItems.find(item => item.id === product.id || item.product_id === product.id);
            setInWishlist(!!found);
            setWishlistItemId(found ? found.wishlist_item_id : null);
          } else {
            setInWishlist(false);
            setWishlistItemId(null);
          }
        } else {
          setInWishlist(false);
          setWishlistItemId(null);
        }
      } catch (err) {
        setInWishlist(false);
        setWishlistItemId(null);
      }
    }
    checkWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, product && product.id]);

  const handleWishlistClick = async () => {
    if (!currentUser || !product || !product.id) {
      return;
    }
    try {
      if (inWishlist && wishlistItemId) {
        const { success, error } = await removeFromWishlist(wishlistItemId);
        if (success) {
          setInWishlist(false);
          setWishlistItemId(null);
          window.dispatchEvent(new Event('wishlistUpdated'));
        }
      } else {
        const { success, wishlistItem, error } = await addToWishlist(currentUser.id, product.id);
        if (success) {
          setInWishlist(true);
          setWishlistItemId(wishlistItem ? wishlistItem.id : null);
          window.dispatchEvent(new Event('wishlistUpdated'));
        }
      }
    } catch (err) {
      // Error handling
    }
  };

  const handleAddToCart = async () => {
    if (!currentUser) {
      alert("Please login to add items to cart.");
      return;
    }

    if (!product || !product.id) {
      /* alert("Product information is missing."); */
      return;
    }
    setCartLoading(true);
    try {
      const { success, error, cartItem } = await addToCart(currentUser.id, product.id, 1);
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

  // Default values if product is not provided
  const defaultProduct = {
    id: 1,
    name: "Sample Product",
    category: "category",
    price: 29.99,
    oldPrice: 39.99,
    rating: 4,
    reviewCount: 10,
    discount: 25,
    image: "https://placehold.co/300x300?text=Product",
    description: "Premium quality product with excellent features and modern design for everyday use."
  };

  // Function to truncate description to a fixed number of words
  const truncateDescription = (text, wordCount = 15) => {
    if (!text) return "Premium quality product with excellent features and modern design for everyday use.";
    const words = text.split(' ');
    if (words.length <= wordCount) return text;
    return words.slice(0, wordCount).join(' ') + '...';
  };

  // Use provided product data or defaults
  const {
    id,
    name,
    category,
    subcategories,
    price,
    old_price,
    rating,
    reviewCount,
    discount,
    image,
    description,
    uom
  } = product || defaultProduct;

  // Get subcategory name and category name from the joined data
  const subcategoryName = subcategories?.name;
  const categoryName = subcategories?.categories?.name || category;



  if (isMobile) return (
    <div className="w-full h-100 bg-white rounded-xl shadow-md p-2 flex flex-col">
      <div className="relative w-full h-full rounded-md overflow-hidden bg-white flex items-center justify-center">
        <Link to={`/product/${id}`}>
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => (e.target.src = "https://placehold.co/100x100")}
          />
        </Link>
        {discount && (
          <div className="absolute top-0 left-0 bg-red-600 text-white text-[15px] font-bold px-1 py-[2px] z-10">
            {discount}% off
          </div>
        )}
        <div className="absolute top-1 right-1 bg-white text-[15px] font-semibold px-2 py-[1px] rounded shadow z-10">
          <span className="text-green-600">{rating}</span> ★
        </div>
      </div>

      <div className="mt-2 flex flex-col justify-between flex-1">
        <h3 className="text-[13px] font-medium line-clamp-2">{name}</h3>
        {uom ? <p className='text-xs text-gray-500 mt-1'>{uom}</p> : <p className="text-xs text-gray-500 mt-1">1 Variant</p>}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex justify-evenly items-center text-[15px] w-25  bg-yellow-300 px-1 py-[2px] rounded">
            <span className="text-black font-semibold w-10 mr-1">₹{price.toFixed(0)}</span>
            {old_price && old_price !== 0 && (
              <span className="text-gray-800 line-through w-15 text-[12px] px-1 pl-2 bg-white rounded-r-sm clip-left">
                ₹{old_price.toFixed(0)}
              </span>
            )}
          </div>
          <button className="bg-green-600 text-white text-xs font-semibold px-4 mr-5 rounded-full"
            onClick={handleAddToCart}
            disabled={!currentUser || cartLoading}>
            {cartAdded ? "✔️" : <ShoppingCartIcon style={{ fontSize: "16px" }} />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col sm:flex-row bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      {/* Image section */}
      <div className="relative w-full sm:w-1/4 h-48 sm:h-auto">
        {discount && (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-red-500 text-white text-[10px] sm:text-xs px-1 sm:px-2 py-[2px] sm:py-1 rounded">
              -{discount}%
            </span>
          </div>
        )}

        <Link to={`/product/${id}`} className="block h-full">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/300x300?text=Product';
            }}
          />
        </Link>
      </div>

      {/* Content section */}
      <div className="flex-1 p-3 sm:p-6 flex flex-col">
        <div className="mb-1">
          {subcategoryName ? (
            <Link
              to={`/productListing?subcategory=${encodeURIComponent(subcategoryName)}&category=${encodeURIComponent(categoryName)}`}
              className="text-xs sm:text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              {subcategoryName.charAt(0).toUpperCase() + subcategoryName.slice(1)}
            </Link>
          ) : (
            <Link
              to={`/productListing?category=${encodeURIComponent(categoryName)}`}
              className="text-xs sm:text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              {categoryName?.charAt(0).toUpperCase() + categoryName?.slice(1)}
            </Link>
          )}
        </div>

        <h3 className="text-base sm:text-lg font-medium mb-2 line-clamp-2">
          <Link to={`/product/${id}`} className="hover:text-blue-600 transition-colors">
            {name}
          </Link>
        </h3>

        <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
          {description || `${name} - high-quality product available at BBMart.`}
        </p>

        <div className="flex items-center mb-2">
          <Rating
            value={rating}
            precision={0.5}
            size="small"
            readOnly
            className="text-amber-400"
          />
          {reviewCount > 0 && (
            <span className="text-xs text-gray-500 ml-2">({reviewCount})</span>
          )}
        </div>

        <div className="flex items-center gap-2 mb-3">
          {old_price && (
            <span className="text-gray-500 line-through text-sm">₹{old_price.toFixed(2)}</span>
          )}
          <span className="text-red-600 font-bold text-base sm:text-xl">₹{price.toFixed(2)}</span>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2">
          <Button
            variant="contained"
            startIcon={<ShoppingCartIcon />}
            className="bg-blue-600 hover:bg-blue-700 min-h-[36px] sm:min-h-[44px] px-3 sm:px-4 text-xs sm:text-sm"
          >
            Add to Cart
          </Button>

          <div className="flex items-center">
            <Tooltip title="Add to wishlist">
              <StyledIconButton aria-label="wishlist">
                <FavoriteBorderIcon fontSize="small" />
              </StyledIconButton>
            </Tooltip>

            <Tooltip title="Quick view">
              <StyledIconButton aria-label="quick view" onClick={handleQuickView}>
                <VisibilityIcon fontSize="small" />
              </StyledIconButton>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>

  );
};

export default ProductItem;
