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
        if (selectedAddress) {
          const { latitude, longitude } = selectedAddress;
          const { success, products } = await getNearbyProducts(latitude, longitude);
          /* console.log("Nearby products:", products); // Debugging */
          setProducts(success && Array.isArray(products) ? products : []);
        } else {
          const { success, products } = await getAllProducts();
          console.log(products)
          setProducts(success && Array.isArray(products) ? products : []);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      }
    };

    fetchProducts();
  }, [selectedAddress]);


  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-8">
      {products.map((product) => (
        <ProductCard key={product.id || product.product_id } {...product} />
      ))}
    </div>
  );
};

export default ProductGrid;
