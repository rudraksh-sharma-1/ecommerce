import { useState, useEffect } from "react";
import { getAllCategories } from "../../utils/supabaseApi";
import { Link, useLocation } from "react-router-dom";

const MobileCategoriesBar = () => {
  const [categories, setCategories] = useState([]);
  const location = useLocation(); // Get current path

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const CategoriesResult = await getAllCategories();
        if (CategoriesResult.success && CategoriesResult.categories) {
          const featuredCategories = CategoriesResult.categories.filter(
            (cat) => cat.active && cat.featured
          );
          setCategories(featuredCategories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  if (location.pathname !== "/") return null;

  return (
    <>
    <div className="flex justify-center">
      <img src="https://i.postimg.cc/rmH2JrtW/Shop-By-Category-removebg-preview.png" alt="Shop By Category" className="p-4 pb-0 md:hidden" />
    </div>
    <div
      className={`grid grid-cols-4 gap-4 px-2 py-4 sm:hidden ${
        location.pathname === "/" ? "mt-0" : "mt-15"
      }`}
    >
      {categories.map((category) => (
        <div
          key={category.id}
          className="flex flex-col items-center"
        >
          <div className="w-20 h-20 rounded-t-full bg-[#e6f5e6] flex items-center justify-center">
            <Link to={`/subcategories/${encodeURIComponent(category.name)}`}>
              <img
                src={category.image_url}
                alt={category.name}
                className=" w-18 h-18 object-contain"
              />
            </Link>
          </div>
          <Link to={`/subcategories/${encodeURIComponent(category.name)}`}>
            <span className="text-sm text-center flex justify-center">{category.name}</span>
          </Link>
        </div>
      ))}
    </div>
    </>
  );
};

export default MobileCategoriesBar;
