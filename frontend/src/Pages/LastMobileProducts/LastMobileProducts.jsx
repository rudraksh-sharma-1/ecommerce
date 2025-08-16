// src/pages/Products.jsx
import React from "react";
import ProductGrid from "../../components/ProductGrid/ProductGrid.jsx";
import supabase from "../../utils/supabase.js";
import { useState, useEffect } from "react";

const ProductsNew = () => {
  const [isVisible, setIsVisible] = useState(null);
  useEffect(() => {
    const fetchVisibility = async () => {
      const { data, error } = await supabase
        .from("product_grid_settings")
        .select("is_visible")
        .single();

      if (data) setIsVisible(data.is_visible);
    };

    fetchVisibility();

    // ✅ Real-time listener setup
    const channel = supabase
      .channel("product-grid-visibility")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "product_grid_settings",
        },
        (payload) => {
          const updatedVisibility = payload.new.is_visible;
          setIsVisible(updatedVisibility);
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (isVisible === null) {
    return;
  }

  if (!isVisible) {
    return;
  }
  return (
    <div className="md:hidden bg-cyan-50">
      {/* <h1 className="text-center">BIGBESTMART DEAL</h1> */}
      <img
        src="https://i.postimg.cc/y87hjDY4/BIGBESTDEALS-removebg-preview.png"
        alt="BigBestMart Deals"
        className="mx-auto w-[90%] max-w-xs bg-transparent"
      />
      <ProductGrid />
    </div>
  );
};

export default ProductsNew;
