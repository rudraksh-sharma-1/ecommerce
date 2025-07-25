// components/ConditionalCategoriesBar.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import CategoriesBar from ".";

const ConditionalCategoriesBar = () => {
  const location = useLocation();

  // Hide CategoriesBar on /MobileAccount
  if (location.pathname === "/MobileAccount") {
    return null;
  }

  return <CategoriesBar />;
};

export default ConditionalCategoriesBar;
