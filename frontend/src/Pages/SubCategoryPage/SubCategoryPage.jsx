import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import supabase from "../../utils/supabase.ts"; // Adjust the path if needed

const SubCategoryPage = () => {
  const { categoryName } = useParams();
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const fetchSubcategories = async () => {
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("id")
        .eq("name", decodeURIComponent(categoryName))
        .single();

      if (categoryError) {
        console.error("Error fetching category:", categoryError);
        return;
      }

      const category_id = categoryData.id;

      const { data: subcategoryData, error: subcategoryError } = await supabase
        .from("subcategories")
        .select("*")
        .eq("category_id", category_id);

      if (subcategoryError) {
        console.error("Error fetching subcategories:", subcategoryError);
      } else {
        setSubcategories(subcategoryData);
        if (subcategoryData.length > 0) {
          setSelectedSubcategory(subcategoryData[0]); // Select first by default
        }
      }
    };

    fetchSubcategories();
  }, [categoryName]);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!selectedSubcategory) return;

      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .eq("subcategory_id", selectedSubcategory.id);

      if (error) {
        console.error("Error fetching groups:", error);
      } else {
        setGroups(data);
      }
    };

    fetchGroups();
  }, [selectedSubcategory]);

  return (
    <div className="flex flex-row">
      {/* Sidebar */}
      <aside className="md:w-40 sm:w-20 bg-white border-0 rounded shadow-lg shadow-cyan-500/50 h-screen overflow-y-auto p-4 hide-scrollbar">
        <h2 className="text-xl font-semibold mb-6 text-center text-orange-500">
          {decodeURIComponent(categoryName)}
        </h2>

        <ul className="space-y-6">
          {subcategories.length > 0 ? (
            subcategories.map((sub, idx) => (
              <li key={sub.id}>
                <div
                  onClick={() => setSelectedSubcategory(sub)}
                  className={`flex flex-col items-center text-center cursor-pointer transition hover:text-blue-600 ${
                    selectedSubcategory?.id === sub.id
                      ? "text-blue-600 font-semibold"
                      : ""
                  }`}
                >
                  <img
                    src={sub.image_url}
                    alt={sub.name}
                    className="w-15 h-15 rounded-full object-cover border border-gray-300 shadow-sm mb-2"
                  />
                  <span className="text-sm">{sub.name}</span>
                </div>
                {idx !== subcategories.length - 1 && (
                  <hr className="my-4 border-gray-200" />
                )}
              </li>
            ))
          ) : (
            <li className="text-center text-gray-500">
              No subcategories found
            </li>
          )}
        </ul>
      </aside>

      {/* Right Section: Groups */}
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-6 text-gray-700">
          {selectedSubcategory
            ? `Groups in ${selectedSubcategory.name}`
            : "Select a Subcategory"}
        </h1>

        {groups.length > 0 ? (
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            {groups.map((group) => (
              <Link
                key={group.id}
                to={`/productListing?group=${encodeURIComponent(
                  group.name
                )}&subcategory=${encodeURIComponent(
                  selectedSubcategory?.name || ""
                )}&category=${encodeURIComponent(
                  decodeURIComponent(categoryName)
                )}`}
              >
                {/* Mobile version: flat design, no border or box */}
                <div className="flex flex-col items-center justify-center space-y-2 sm:border sm:rounded-lg sm:h-37 sm:shadow p-2">
                  <img
                    src={group.image_url}
                    alt='group image'
                    className="aspect-square sm:w-15 sm:h-15 rounded-full object-cover border  mb-1"
                  />
                  <p className="text-xs sm:text-sm text-center font-medium">
                    {group.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            No groups available for this subcategory.
          </p>
        )}
      </div>
    </div>
  );
};

export default SubCategoryPage;
