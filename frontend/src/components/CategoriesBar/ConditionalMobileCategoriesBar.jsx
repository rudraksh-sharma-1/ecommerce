// components/ConditionalCategoriesBar.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import MobileCategoriesBar from ".";

const ConditionalMobileCategoriesBar = () => {
  const location = useLocation();

  // Hide CategoriesBar on /MobileAccount
  if (location.pathname === "/MobileAccount") {
    return null;
  }

  return <MobileCategoriesBar/>;
};

export default ConditionalMobileCategoriesBar;
