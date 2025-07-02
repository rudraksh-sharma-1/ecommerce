import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllCategories } from "../utils/supabaseApi";

const CategoryCollapse = ({ setIsOpenCatPanel }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function fetchCategories() {
      const { success, categories } = await getAllCategories();
      if (success && categories) {
        setCategories(categories);
      } else {
        setCategories([]);
      }
    }
    fetchCategories();
  }, []);

  return (
    <div className="scroll">
      <ul className="w-full">
        {categories.map((cat) => (
          <li key={cat.id} className="list-none flex items-center relative flex-col">
            <Link
              to={`/productListing?category=${encodeURIComponent(cat.name)}`}
              className="w-full"
              onClick={() => setIsOpenCatPanel(false)}
            >
              <div className="w-full !text-left !justify-start !px-3 !text-[black] py-2 cursor-pointer hover:bg-gray-100">
                {cat.name}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryCollapse;