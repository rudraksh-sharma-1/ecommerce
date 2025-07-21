import React, { useState, useEffect } from "react";
import HomeSlider from "../../components/HomeSlider";
import Search from "../../components/Search";
import { FaShippingFast } from "react-icons/fa";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useAuth } from "../../contexts/AuthContext";
import ProductsSlider from "../../components/ProductsSlider";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
// import required modules
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom"; // Import Link from react-router-dom
import {
  getDefaultUserAddress,
  getNearbyProducts,
  getAllProducts,
  getAllCategories,
  getAllBanners,
} from "../../utils/supabaseApi";
import { usePromotional } from "../../contexts/PromotionalContext.jsx";
import FlashSale from "../../components/FlashSale";
import "./home.css";

function ProductTabs({ categories }) {
  const [value, setValue] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{
        width: "100%",
        typography: {
          fontSize: {
            xs: "0.8rem",
            sm: "0.875rem",
          },
        },
      }}
    >
      <Tabs
        value={value}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="product category tabs"
        sx={{
          "& .MuiTab-root": {
            minHeight: "44px",
            padding: "8px 16px",
            fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.875rem" },
          },
        }}
      >
        <Tab label="All Products" />
        {categories &&
          categories
            .filter((cat) => cat.active)
            .map((cat) => <Tab key={cat.id} label={cat.name} />)}
      </Tabs>
    </Box>
  );
}

export const Home = () => {
  const { getPromoSetting } = usePromotional();
  const navigate = useNavigate();

  // Supabase-driven product/category/banner state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  /* const [defaultAddress, setDefaultAddress] = useState(null); */

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [hasAnnouncementBar, setHasAnnouncementBar] = useState(false);

  const { currentUser } = useAuth(); // 👈 Get from context
  useEffect(() => {
    async function fetchAllData() {
      setLoading(true);

      let productFetchFn;

      try {
        const userId = currentUser?.id;

        if (userId) {
          const defaultAddress = await getDefaultUserAddress(userId);
          /* setDefaultAddress(defaultAddressChange); */

          /* console.log(defaultAddress) */
          /* console.log(
            "Latitude:",
            defaultAddress.latitude,
            "Longitude:",
            defaultAddress.longitude
          );
 */
          if (defaultAddress?.latitude && defaultAddress?.longitude) {
            productFetchFn = () =>
              getNearbyProducts(
                defaultAddress.latitude,
                defaultAddress.longitude
              );
          } else {
            productFetchFn = getAllProducts;
          }
        } else {
          productFetchFn = getAllProducts;
        }
      } catch (err) {
        console.error("Error fetching user or address:", err);
        productFetchFn = getAllProducts;
      }
      /* console.log(productFetchFn); */

      const [
        { success: prodSuccess, products: prodData },
        { success: catSuccess, categories: catData },
        { success: banSuccess, banners: banData },
      ] = await Promise.all([
        productFetchFn(),
        getAllCategories(),
        getAllBanners(),
      ]);

      setProducts(
        prodSuccess && prodData
          ? prodData.map((p) => ({ ...p, id: p.product_id }))
          : []
      );
      setCategories(catSuccess && catData ? catData : []);
      setBanners(banSuccess && banData ? banData : []);
      setLoading(false);
    }

    fetchAllData();
  }, [currentUser]); // 👈 Add dependency

  /* console.log("All Products Fetched:", products); */

  const getProductsByCategory = (category) => {
    return products
      .filter(
        (product) =>
          (product.category || "").toLowerCase() === category.toLowerCase()
      )
      .slice(0, 8);
  };

  const popularProducts = products
    .filter((product) => product.popular)
    .slice(0, 10);
  const newProducts = products.slice(0, 10);
  const featuredProducts = products
    .filter((product) => product.featured)
    .slice(0, 10);

  const [isMobile, setIsMobile] = useState(false);

  // Search handler
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(
        `/productListing?search=${encodeURIComponent(searchQuery.trim())}`
      );
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Check if announcement bar is present
  useEffect(() => {
    const checkAnnouncementBar = () => {
      const announcementElement = document.querySelector(".announcement-bar");
      setHasAnnouncementBar(!!announcementElement);
    };

    checkAnnouncementBar();

    // Listen for changes in case announcement bar is dynamically added/removed
    const observer = new MutationObserver(checkAnnouncementBar);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* Search Bar For mobile Screens */}
      <div className="mobile-search-bar-container  w-full px-5 py-3 pt-5 bg-white">
        <Search />
      </div>

      {/* Add spacer to push content below the search bar on mobile */}
      <div
        className="mobile-search-spacer md:hidden"
        style={{ height: "60px" }}
      ></div>

      <HomeSlider />
      <FlashSale />

      {/* Popular Products Section */}
      <section className="bg-white py-4 mt-0">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-semibold mb-1">
                Popular Products
              </h2>
            </div>
            <div className="w-full md:w-auto md:flex-1">
              <ProductTabs />
            </div>
          </div>

          <ProductsSlider
            products={popularProducts}
            slidesPerViewMobile={1.2}
            slidesPerViewTablet={2.5}
            slidesPerViewDesktop={4}
            slidesPerViewLarge={5}
          />
        </div>
      </section>

      {/* Free Shipping Banner - Keep this dynamic for promotional content */}
      <section className="py-4 bg-white">
        <div className="container px-4">
          <div className="shipping-banner w-full lg:w-[90%] mx-auto py-4 px-4 sm:px-6 border-2 border-red-200 rounded-lg shadow-sm bg-gradient-to-r from-red-50 to-white">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FaShippingFast className="text-3xl sm:text-4xl text-red-500" />
                <span className="text-base sm:text-lg font-semibold uppercase">
                  {getPromoSetting("promo_shipping_title", "Free Shipping")}
                </span>
              </div>

              <div className="text-center sm:text-left">
                <p className="font-medium text-sm sm:text-base">
                  {getPromoSetting(
                    "promo_shipping_description",
                    "Free delivery on your first order and over ₹500"
                  )}
                </p>
              </div>

              <p className="font-bold text-lg sm:text-xl text-red-600">
                {getPromoSetting("promo_shipping_amount", "Only ₹500/-")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Products Section */}
      <section className="py-4 bg-white">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold">
              Latest Products
            </h2>
            <a
              href="/productListing"
              className="text-sm text-blue-600 hover:underline"
            >
              View All
            </a>
          </div>

          <ProductsSlider
            products={newProducts}
            slidesPerViewMobile={1.2}
            slidesPerViewTablet={2.5}
            slidesPerViewDesktop={4}
            slidesPerViewLarge={5}
          />
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-4 bg-white">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold">
              Featured Products
            </h2>
            <a
              href="/productListing"
              className="text-sm text-blue-600 hover:underline"
            >
              View All
            </a>
          </div>

          <ProductsSlider
            products={featuredProducts}
            slidesPerViewMobile={1.2}
            slidesPerViewTablet={2.5}
            slidesPerViewDesktop={4}
            slidesPerViewLarge={5}
          />
        </div>
      </section>
    </>
  );
};

export default Home;
