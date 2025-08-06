import { Link, useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import supabase from "../../utils/supabase.ts";

const SubCategoryPage = () => {
  const { categoryName } = useParams();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [subcategoryGroups, setSubcategoryGroups] = useState({});
  const [sidebarScrolledToBottom, setSidebarScrolledToBottom] = useState(false);
  const sidebarRef = useRef(null);
  const sectionRefs = useRef({});

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (!error) {
        setCategories(data);
        const matched = data.find(cat => cat.name === decodeURIComponent(categoryName));
        setSelectedCategory(matched || null);
      }
    };
    fetchCategories();
  }, [categoryName]);

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!selectedCategory) return;

      const { data, error } = await supabase
        .from("subcategories")
        .select("*")
        .eq("category_id", selectedCategory.id);

      if (!error) {
        setSubcategories(data);
        if (data.length > 0) {
          // Delay to ensure DOM and refs are ready
          setTimeout(() => {
            setSelectedSubcategory(data[0]);
          }, 100); // 100ms is usually enough
        }
      }
    };
    fetchSubcategories();
  }, [selectedCategory]);

  useEffect(() => {
    const fetchAllSubcategoryGroups = async () => {
      const groupMap = {};
      for (const sub of subcategories) {
        const { data, error } = await supabase
          .from("groups")
          .select("*")
          .eq("subcategory_id", sub.id);

        if (!error) {
          groupMap[sub.name] = data;
        }
      }
      setSubcategoryGroups(groupMap);
    };

    if (subcategories.length > 0) {
      fetchAllSubcategoryGroups();
    }
  }, [subcategories]);


  useEffect(() => {
    const observerOptions = {
      root: document.querySelector(".scrollable-container"), // the scrolling wrapper
      rootMargin: "-40px 0px 0px 0px",
      threshold: 0.2, // 50% visible
    };

    const observer = new IntersectionObserver((entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visibleEntries.length > 0) {
        const topEntry = visibleEntries[0];
        const visibleSubId = topEntry.target.getAttribute("data-subid");
        const matchingSub = subcategories.find((sub) => sub.id.toString() === visibleSubId);
        if (matchingSub) {
          setSelectedSubcategory(matchingSub);
        }
      }

    }, observerOptions);

    // Observe each section
    subcategories.forEach((sub) => {
      const section = sectionRefs.current[sub.id];
      if (section) {
        section.setAttribute("data-subid", sub.id);
        observer.observe(section);
      }
    });

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, [subcategories]);


  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Fixed Sidebar */}
      <aside
        ref={sidebarRef}
        onScroll={() => {
          const el = sidebarRef.current;
          if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) {
            setSidebarScrolledToBottom(true);
          }
        }}
        className="w-20 bg-white border-r-0 shadow h-full overflow-y-auto hide-scrollbar fixed left-0 top-0 ">
        <ul className="flex flex-col items-center pb-13">
          {categories.map(cat => (
            <li
              key={cat.id}
              onClick={() => setSelectedCategory(cat)}
              className={`flex flex-col items-center text-center justify-between text-xl h-25 cursor-pointer px-2  ${selectedCategory?.id === cat.id
                ? "bg-amber-50 font-semibold"
                : "hover:bg-gray-200 text-gray-700"
                }`} style={{ fontFamily: '"Great Vibes", cursive', color: '#92400e' }}
            >
              <div className="border-[0.5px] border-r-0 w-20 h-30 flex flex-col align-middle items-center justify-center">
                <img
                  src={cat.image_url || "https://placehold.co/40x40"}
                  alt={cat.name}
                  className="w-20 h-20 object-cover "
                />
                <span
                  className={`text-xl text-center w-full ${cat.name === "Well-Being" ? "text-sm" : ""
                    }`}
                >
                  {cat.name}
                </span>

              </div>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <div className="ml-20 w-full flex-1 flex flex-col">
        {/* Fixed Subcategory Bar */}
        <div className="bg-white fixed top-0 left-20 right-0  w-auto px-2 border-0 ">
          <h1 className="text-xl font-semibold mt-1 mb-1 bg-gradient-to-r from-pink-400 via-yellow-400 to-green-400
            bg-clip-text text-transparent tracking-wide">
            {selectedCategory?.name || "Category"}
          </h1>

          <div className="flex space-x-3 overflow-x-auto hide-scrollbar pb-1">
            {subcategories.map(sub => (
              <div
                key={sub.id}
                onClick={() => {
                  setSelectedSubcategory(sub)
                  const section = sectionRefs.current[sub.id];
                  if (section) {
                    section.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                className={`flex flex-col items-center min-w-[70px] h-[80px]  rounded-md cursor-pointer ${selectedSubcategory?.id === sub.id
                  ? "bg-amber-50 text-black"
                  : "bg-gray-100 text-gray-700"
                  }`}
              >
                <img
                  src={sub.image_url}
                  alt="Image"
                  className="w-full h-[55px] mb-1 rounded-t-md"
                />
                <span className="text-[11px] text-center truncate w-full px-1">{sub.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable Group Section */}
        <div className="flex-1 overflow-y-auto px-2 mt-20 pb-6 pt-3 scrollable-container">
          {subcategories.map((sub, index) => (
            <div key={sub.id} ref={(el) => (sectionRefs.current[sub.id] = el)} className="mb-6 scroll-mt-16">
              {/* Subcategory Title */}
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {sub.name}
              </h3>

              {/* Group Grid */}
              <div className="grid grid-cols-3 gap-2">
                {(subcategoryGroups[sub.name] || []).map(group => (
                  <div key={group.id} className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 border rounded-full overflow-hidden bg-gray-300">
                      <Link
                        to={`/productListing?group=${encodeURIComponent(group.name)}&subcategory=${encodeURIComponent(sub.name)}&category=${encodeURIComponent(selectedCategory?.name || "")}`}
                        className="flex items-center align-middle w-full h-full"
                      >
                        <img
                          src={group.image_url}
                          alt="Image"
                          className="w-full h-full object-cover"
                        />
                      </Link>
                    </div>
                    <p className="text-[11px] font-medium text-center break-words w-full mt-1 leading-tight">
                      {group.name}
                    </p>
                  </div>
                ))}
              </div>

              {/* Divider between subcategories (not after last) */}
              {index < subcategories.length - 1 && (
                <hr className="my-4 border-t border-gray-300" />
              )}
            </div>
          ))}
        </div>


      </div>
    </div>
  );
};

export default SubCategoryPage;
