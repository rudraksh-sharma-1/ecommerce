import React, { useState, useEffect } from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import HomeIcon from "@mui/icons-material/Home";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import ProductZoom from "../../components/ProductZoom/Index";
import { useParams } from "react-router-dom";
import { getAllProducts, getProductsByCategory } from "../../utils/supabaseApi";
import Rating from "@mui/material/Rating";
import {
  Button,
  IconButton,
  Tabs,
  Tab,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import { FaRegHeart } from "react-icons/fa";
import { IoGitCompareOutline } from "react-icons/io5";
import { MdOutlineShoppingCart } from "react-icons/md";
import ProductItem from "../../components/Productitem";
import { useAuth } from "../../contexts/AuthContext";
import Search from "../../components/Search";
import { addToCart, addToWishlist } from "../../utils/supabaseApi";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const ProductDetails = () => {
  const { currentUser } = useAuth();
  const [cartLoading, setCartLoading] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistAdded, setWishlistAdded] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Add to Cart handler
  const handleAddToCart = async () => {
    if (!currentUser || !productData || !productData.id) {
      alert("Please login to add to cart.");
      return;
    }
    setCartLoading(true);
    try {
      const { success, error } = await addToCart(
        currentUser.id,
        productData.id,
        quantity
      );
      setCartLoading(false);
      if (success) {
        setCartAdded(true);
        window.dispatchEvent(new Event("cartUpdated"));
        setTimeout(() => setCartAdded(false), 1200);
      } else {
        alert("Failed to add to cart: " + error);
      }
    } catch (err) {
      setCartLoading(false);
      alert("Error adding to cart.");
    }
  };

  // Add to Wishlist handler
  const handleAddToWishlist = async () => {
    if (!currentUser || !productData || !productData.id) {
      alert("Please login to add to wishlist.");
      return;
    }
    setWishlistLoading(true);
    try {
      const { success, error } = await addToWishlist(
        currentUser.id,
        productData.id
      );
      setWishlistLoading(false);
      if (success) {
        setWishlistAdded(true);
        window.dispatchEvent(new Event("wishlistUpdated"));
        setTimeout(() => setWishlistAdded(false), 1200);
      } else {
        alert("Failed to add to wishlist: " + error);
      }
    } catch (err) {
      setWishlistLoading(false);
      alert("Error adding to wishlist.");
    }
  };

  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      const { success, products } = await getAllProducts();
      let product = null;
      if (success && products) {
        product = products.find((p) => String(p.id) === String(id));
      }
      setProductData(
        product
          ? {
              ...product,
              rating: product.rating ?? 0,
              reviewCount: product.review_count ?? 0,
              oldPrice: product.old_price ?? null,
              inStock: product.in_stock ?? true,
              images: product.images
                ? product.images
                : [
                    product.image ??
                      "https://placehold.co/300x300?text=Product",
                  ],
              description: product.description ?? "",
              features: product.features ?? [],
              specifications: product.specifications ?? {},
            }
          : null
      );
      setLoading(false);
      // Fetch related products (same category, exclude current)
      if (product && product.category) {
        const { success: relSuccess, products: relProducts } =
          await getProductsByCategory(product.category);
        if (relSuccess && relProducts) {
          setRelatedProducts(
            relProducts
              .filter((p) => String(p.id) !== String(product.id))
              .slice(0, 4)
          );
        } else {
          setRelatedProducts([]);
        }
      } else {
        setRelatedProducts([]);
      }
    }
    fetchProduct();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleQuantityChange = (amount) => {
    const newQuantity = Math.max(1, quantity + amount);
    setQuantity(newQuantity);
  };

  if (loading) {
    return <div className="container px-4 py-8 text-center">Loading...</div>;
  }
  if (!productData) {
    return (
      <div className="container px-4 py-8 text-center">Product not found.</div>
    );
  }

  return (
    <>
      {/* Search Bar For mobile Screens */}
      <div className="mobile-search-bar-container block md:hidden w-full mt-3 px-5 py-3">
        <Search />
      </div>
      {/* this div is only for spacing between search bar and product detail */}
      <div className="mt-5 h-12 md:hidden"></div>
      <div className="py-3 sm:py-5 bg-gray-50">
        <div className="container px-4">
          <Breadcrumbs aria-label="breadcrumb" className="text-sm mb-4">
            <Link
              underline="hover"
              sx={{ display: "flex", alignItems: "center" }}
              color="inherit"
              href="/"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
              <span className="text-xs sm:text-sm">Home</span>
            </Link>
            <Link
              underline="hover"
              sx={{ display: "flex", alignItems: "center" }}
              color="inherit"
              href={`/productListing?category=${encodeURIComponent(
                productData.category || ""
              )}`}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              <span className="text-xs sm:text-sm">
                {productData.category || "Category"}
              </span>
            </Link>
            <Typography
              sx={{ display: "flex", alignItems: "center" }}
              color="text.primary"
              fontSize="inherit"
            >
              <span className="text-xs sm:text-sm truncate max-w-[150px] sm:max-w-none">
                {productData.name}
              </span>
            </Typography>
          </Breadcrumbs>
        </div>
      </div>

      <section className="py-4 sm:py-8 bg-white">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            {/* Product Images */}
            <div className="w-full md:w-[45%] lg:w-[40%]">
              <ProductZoom images={productData.images} />
            </div>

            {/* Product Info */}
            <div className="w-full md:w-[55%] lg:w-[60%]">
              <h1 className="text-xl sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-3">
                {productData.name}
              </h1>

              <div className="flex items-center gap-2 mb-4">
                <Rating
                  value={productData.rating}
                  precision={0.5}
                  readOnly
                  size="small"
                />
                <span className="text-sm text-gray-600">
                  ({productData.reviewCount} reviews)
                </span>
              </div>

              <div className="mb-4">
                <span className="text-lg sm:text-xl font-bold text-blue-600">
                  ₹{productData.price.toFixed(2)}
                </span>
                {productData.oldPrice && (
                  <span className="ml-3 text-sm sm:text-base text-gray-500 line-through">
                    ₹{productData.oldPrice.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="text-sm mb-6 text-gray-700">
                <p>{productData.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <span className="text-gray-700 mr-2 w-24">Availability:</span>
                  {productData.inStock ? (
                    <span className="text-green-600 font-medium">In Stock</span>
                  ) : (
                    <span className="text-red-600 font-medium">
                      Out of Stock
                    </span>
                  )}
                </div>

                <div className="flex items-center">
                  <span className="text-gray-700 mr-2 w-24">Category:</span>
                  <span>{productData.category}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
                <div className="flex items-center h-12 rounded-md border border-gray-300">
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="h-full aspect-square text-xl"
                  >
                    -
                  </Button>
                  <div className="w-12 text-center font-medium">{quantity}</div>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => handleQuantityChange(1)}
                    className="h-full aspect-square text-xl"
                  >
                    +
                  </Button>
                </div>

                <Button
                  variant="contained"
                  startIcon={<MdOutlineShoppingCart />}
                  className="bg-blue-600 hover:bg-blue-700 py-3"
                  fullWidth
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                >
                  {cartAdded
                    ? "Added!"
                    : cartLoading
                    ? "Adding..."
                    : "Add to Cart"}
                </Button>

                <IconButton
                  aria-label="add to favorites"
                  className="border border-gray-300 rounded-md h-12 w-12"
                  onClick={handleAddToWishlist}
                  disabled={wishlistLoading}
                >
                  <FaRegHeart color={wishlistAdded ? "red" : undefined} />
                </IconButton>

                {/* <IconButton aria-label="compare" className="border border-gray-300 rounded-md h-12 w-12">
                  <IoGitCompareOutline />
                </IconButton> */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Details Tabs */}
      <section className="py-6 sm:py-8 bg-gray-50">
        <div className="container px-4">
          <Box
            sx={{
              width: "100%",
              typography: {
                fontSize: { xs: "0.875rem", sm: "0.9rem", md: "1rem" },
              },
            }}
          >
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="product details tabs"
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  "& .MuiTab-root": {
                    fontSize: { xs: "0.875rem", sm: "0.9rem" },
                    padding: { xs: "10px", sm: "12px 16px" },
                  },
                }}
              >
                <Tab label="Description" id="product-tab-0" />
                {/* <Tab label="Features" id="product-tab-1" /> */}
                {/* <Tab label="Specifications" id="product-tab-2" /> */}
                <Tab label="Reviews" id="product-tab-3" />
              </Tabs>
            </Box>
            <TabPanel value={tabValue} index={0}>
              <p className="text-sm sm:text-base text-gray-700">
                {productData.description}
              </p>
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <ul className="list-disc pl-5 space-y-2">
                {productData.features.map((feature, index) => (
                  <li
                    key={index}
                    className="text-sm sm:text-base text-gray-700"
                  >
                    {feature}
                  </li>
                ))}
              </ul>
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(productData.specifications).map(
                  ([key, value]) => (
                    <div key={key} className="flex border-b pb-2">
                      <span className="text-sm sm:text-base font-medium w-36">
                        {key}:
                      </span>
                      <span className="text-sm sm:text-base text-gray-700">
                        {value}
                      </span>
                    </div>
                  )
                )}
              </div>
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
              <div className="text-center py-4">
                <p className="text-sm sm:text-base text-gray-700 mb-4">
                  This product has {productData.reviewCount} reviews with an
                  average rating of {productData.rating} out of 5.
                </p>
                <Button variant="outlined" size="medium">
                  Write a Review
                </Button>
              </div>
            </TabPanel>
          </Box>
        </div>
      </section>

      {/* Related Products */}
      <section className="py-8 bg-white">
        <div className="container px-4">
          <h2 className="text-lg sm:text-xl font-bold mb-6">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {relatedProducts.length === 0 ? (
              <div className="col-span-4 text-gray-500 text-center py-8">
                No related products found.
              </div>
            ) : (
              relatedProducts.map((prod) => (
                <ProductItem key={prod.id} product={prod} />
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductDetails;
