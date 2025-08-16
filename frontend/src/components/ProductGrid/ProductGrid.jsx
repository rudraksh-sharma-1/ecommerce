import React, { useEffect, useState } from "react";
import ProductCard from "../../components/ProductCard2/ProductCard.jsx";
import { useLocationContext } from "../../contexts/LocationContext.jsx";
import { getNearbyProducts, getAllProducts } from "../../utils/supabaseApi.js";

const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  const { selectedAddress } = useLocationContext();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let fetchedProducts = [];

        if (selectedAddress) {
          const { latitude, longitude } = selectedAddress;
          const { success, products } = await getNearbyProducts(latitude, longitude);
          fetchedProducts = success && Array.isArray(products) ? products : [];
        } else {
          const { success, products } = await getAllProducts();
          fetchedProducts = success && Array.isArray(products) ? products : [];
        }

        // Filter only products where is_last_section is true
        const filtered = fetchedProducts.filter(p => p.is_last_section === true);

        setProducts(filtered);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      }
    };

    fetchProducts();
  }, [selectedAddress]);

  return (
    <div className="flex justify-center">
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-4 px-4 sm:px-6 md:px-8 justify-items-center">
        {products.map((product) => (
          <ProductCard key={product.id || product.product_id} {...product} />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
