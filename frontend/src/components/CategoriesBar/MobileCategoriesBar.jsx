import { useState, useEffect } from "react";
import { getAllCategories } from "../../utils/supabaseApi";
import { Link, useLocation } from "react-router-dom";
// Sample Category Data

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
    <div className={`overflow-x-auto no-scrollbar flex space-x-2 px-2 py-2 pt-4 ${location.pathname === '/' ? 'mt-0' : 'mt-15'} sm:hidden`}>
      {categories.map((category) => (
        <div
          key={category.id}
          className="flex-shrink-0 w-24 flex flex-col items-center"
        >
          <div className="w-24 h-24 rounded-t-full bg-[#e6f5e6] flex items-center justify-center">
            <Link to={`/subcategories/${encodeURIComponent(category.name)}`}>
              <img
                src={category.image_url}
                alt={category.name}
                className="w-24 h-24 object-contain"
              />
            </Link>
          </div>
          <Link to={`/subcategories/${encodeURIComponent(category.name)}`}>
            <span className="text-sm text-center">{category.name}</span>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default MobileCategoriesBar;
