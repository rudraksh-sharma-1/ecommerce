import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import "../Sidebar/style.css";

import { Collapse } from "react-collapse";
import { FaAngleDown } from "react-icons/fa6";
import { FaAngleUp } from "react-icons/fa6";
import Button from "@mui/material/Button";

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getAllCategories,
  getAllSubcategories,
  getAllGroups,
} from "../../utils/supabaseApi";

import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import Rating from "@mui/material/Rating";

export const Sidebar = ({
  priceRange = [0, 10000],
  setPriceRange,
  minRating = 0,
  setMinRating,
}) => {
  const [isOpenCategoryFilter, setIsOpenCategoryFilter] = useState(true);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [expandedSubcategories, setExpandedSubcategories] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  // Fetch categories, subcategories, and groups from Supabase
  useEffect(() => {
    async function fetchAllHierarchy() {
      const [catRes, subcatRes, groupRes] = await Promise.all([
        getAllCategories(),
        getAllSubcategories(),
        getAllGroups(),
      ]);

      // Filter to only show active items
      setCategories(
        catRes.success
          ? catRes.categories.filter((cat) => cat.active === true)
          : []
      );
      setSubcategories(
        subcatRes.success
          ? subcatRes.subcategories.filter((sub) => sub.active === true)
          : []
      );
      setGroups(
        groupRes.success
          ? groupRes.groups.filter((group) => group.active === true)
          : []
      );
    }
    fetchAllHierarchy();
  }, []);

  // Handle navigation to category/subcategory pages
  const handleCategoryClick = (categoryName) => {
    navigate(`/productListing?category=${encodeURIComponent(categoryName)}`);
  };

  const handleSubcategoryClick = (categoryName, subcategoryName) => {
    navigate(
      `/productListing?subcategory=${encodeURIComponent(
        subcategoryName
      )}&category=${encodeURIComponent(categoryName)}`
    );
  };

  const handleGroupClick = (categoryName, subcategoryName, groupName) => {
    navigate(
      `/productListing?group=${encodeURIComponent(
        groupName
      )}&subcategory=${encodeURIComponent(
        subcategoryName
      )}&category=${encodeURIComponent(categoryName)}`
    );
  };

  // Price slider change handler
  const handlePriceChange = (range) => {
    setPriceRange(range);
  };

  // Rating filter click handler
  const handleRatingClick = (rating) => {
    setMinRating(rating);
  };

  const getSubcategoriesForCategory = (categoryId) =>
    subcategories.filter(
      (sub) => sub.category_id === categoryId && sub.active === true
    );
  const getGroupsForSubcategory = (subcategoryId) =>
    groups.filter(
      (group) => group.subcategory_id === subcategoryId && group.active === true
    );

  // Expand/collapse logic
  const toggleExpandCategory = (categoryId) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  const toggleExpandSubcategory = (subcategoryId) => {
    setExpandedSubcategories((prev) =>
      prev.includes(subcategoryId)
        ? prev.filter((id) => id !== subcategoryId)
        : [...prev, subcategoryId]
    );
  };

  return (
    <aside className="sidebar py-5">
      <div className="box">
        <h3 className="w-full mb-3 text-[16px] font-[600] flex items-center pr-5">
          Shop by Category
          <Button
            className="!w-[30px] !h-[30px] !min-w-[30px] !rounded-full !ml-auto !text-[#000]"
            onClick={() => setIsOpenCategoryFilter(!isOpenCategoryFilter)}
          >
            {isOpenCategoryFilter ? <FaAngleUp /> : <FaAngleDown />}
          </Button>
        </h3>
        <Collapse isOpened={isOpenCategoryFilter}>
          <div className="scroll px-2">
            {categories.map((category) => {
              const subcats = getSubcategoriesForCategory(category.id);
              const isCatExpanded = expandedCategories.includes(category.id);
              return (
                <div key={category.id} className="sidebar-category-group">
                  <div className="sidebar-category-row">
                    <span
                      className="sidebar-category-link"
                      onClick={() => handleCategoryClick(category.name)}
                    >
                      {category.name}
                    </span>
                    {subcats.length > 0 && (
                      <button
                        className="sidebar-plus-btn"
                        onClick={() => toggleExpandCategory(category.id)}
                      >
                        {isCatExpanded ? "−" : "+"}
                      </button>
                    )}
                  </div>
                  {isCatExpanded && subcats.length > 0 && (
                    <div className="sidebar-subcategories-group">
                      {subcats.map((subcat) => {
                        const subcatGroups = getGroupsForSubcategory(subcat.id);
                        const isSubcatExpanded = expandedSubcategories.includes(
                          subcat.id
                        );
                        return (
                          <div
                            key={subcat.id}
                            className="sidebar-subcategory-item"
                          >
                            <div className="sidebar-subcategory-row">
                              <span
                                className="sidebar-subcategory-link"
                                onClick={() =>
                                  handleSubcategoryClick(
                                    category.name,
                                    subcat.name
                                  )
                                }
                              >
                                {subcat.name}
                              </span>
                              {subcatGroups.length > 0 && (
                                <button
                                  className="sidebar-plus-btn"
                                  onClick={() =>
                                    toggleExpandSubcategory(subcat.id)
                                  }
                                >
                                  {isSubcatExpanded ? "−" : "+"}
                                </button>
                              )}
                            </div>
                            {isSubcatExpanded && subcatGroups.length > 0 && (
                              <div className="sidebar-groups-container">
                                {subcatGroups.map((group) => (
                                  <div
                                    key={group.id}
                                    className="sidebar-group-link"
                                    onClick={() =>
                                      handleGroupClick(
                                        category.name,
                                        subcat.name,
                                        group.name
                                      )
                                    }
                                  >
                                    {group.name}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Collapse>
      </div>

      <div className="box mt-4">
        <h3 className="w-full mb-3 text-[16px] font-[600] flex items-center pr-5">
          Filter By Price
        </h3>
        <RangeSlider
          min={0}
          max={10000}
          step={100}
          value={priceRange}
          onInput={handlePriceChange}
        />
        <div className="flex pt-4 pb-2 priceRange">
          <span className="text-[13px]">
            From: <strong className="text-dark">Rs: {priceRange[0]}</strong>
          </span>
          <span className="ml-auto text-[13px]">
            To: <strong className="text-dark">Rs: {priceRange[1]}</strong>
          </span>
        </div>
      </div>
      <div className="box mt-4">
        <h3 className="w-full mb-3 text-[16px] font-[600] flex items-center pr-5">
          Filter By Ratings
        </h3>
        <div className="w-full flex flex-col gap-1">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div
              key={rating}
              className="cursor-pointer flex items-center"
              onClick={() => handleRatingClick(rating)}
            >
              <Rating
                name={`rating-${rating}`}
                value={rating}
                size="small"
                readOnly
              />
              <span
                className={`ml-2 text-xs ${
                  minRating === rating
                    ? "font-bold text-blue-600"
                    : "text-gray-600"
                }`}
              >
                {rating} & up
              </span>
            </div>
          ))}
          <Button
            size="small"
            variant="text"
            className="mt-1 !text-xs !text-blue-600"
            onClick={() => setMinRating(0)}
            disabled={minRating === 0}
          >
            Clear Rating
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
