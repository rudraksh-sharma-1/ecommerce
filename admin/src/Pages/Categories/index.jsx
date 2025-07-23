import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  Title,
  Text,
  Table,
  ActionIcon,
  Group,
  Button,
  TextInput,
  Modal,
  Badge,
  Switch,
  Textarea,
  Image,
  LoadingOverlay,
  Tabs,
  Select,
  FileInput,
  ScrollArea,
  Tooltip,
  Loader,
  Center,
  HoverCard,
} from "@mantine/core";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaTag,
  FaLayerGroup,
  FaChevronDown,
  FaChevronRight,
  FaSpinner,
} from "react-icons/fa";
import { showNotification } from "@mantine/notifications";

// Fetch categories and subcategories from Supabase
import {
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  getAllSubcategories,
  addSubcategory,
  updateSubcategory,
  deleteSubcategory,
  getSubcategoriesByCategory,
  getAllGroups,
  addGroup,
  updateGroup,
  deleteGroup,
  getGroupsBySubcategory,
  getProductsByCategory,
  getProductCountByCategory,
  checkCategoryHasProducts,
} from "../../utils/supabaseApi";

const styles = `
  .categories-table {
    min-width: 100%;
    table-layout: fixed;
  }
  
  .categories-table th {
    background-color: #f8f9fa;
    font-weight: 600;
    font-size: 0.875rem;
    color: #495057;
    border-bottom: 2px solid #dee2e6;
    padding: 12px 8px;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  
  .categories-table td {
    padding: 8px;
    vertical-align: middle;
    border-bottom: 1px solid #e9ecef;
  }
  
  .categories-table tbody tr:hover {
    background-color: #f8f9fa;
  }
  
  .dark .categories-table tbody tr:hover {
    background-color: rgba(75, 85, 99, 0.5);
  }
  
  .categories-table td {
    border-bottom: 1px solid #e9ecef;
  }
  
  .dark .categories-table td {
    border-bottom: 1px solid rgba(75, 85, 99, 0.3);
  }
  
  .scroll-area-custom::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  .scroll-area-custom::-webkit-scrollbar-track {
    background: #f1f3f4;
    border-radius: 4px;
  }
  
  .scroll-area-custom::-webkit-scrollbar-thumb {
    background: #c1c8cd;
    border-radius: 4px;
  }
  
  .scroll-area-custom::-webkit-scrollbar-thumb:hover {
    background: #a8b1b8;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("categories");
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  // Product counts for categories
  const [productCounts, setProductCounts] = useState({});

  /* SubCategory Image Modal and Subcategory Modal */
  const [subcategoryImageModalOpen, setSubcategoryImageModalOpen] =
    useState(false);
  const [previewSubcategoryImage, setPreviewSubcategoryImage] = useState(null);
  const [subcategoryImageFile, setSubcategoryImageFile] = useState(null);

  // Infinite scroll state
  const [visibleCategories, setVisibleCategories] = useState([]);
  const [visibleSubcategories, setVisibleSubcategories] = useState([]);
  const [visibleGroups, setVisibleGroups] = useState([]);
  const [visibleHierarchy, setVisibleHierarchy] = useState([]);

  const [categoryFilter, setCategoryFilter] = useState("");
  const [subcategoryFilter, setSubcategoryFilter] = useState("");

  // Refs for infinite scroll
  const categoriesScrollRef = useRef(null);
  const subcategoriesScrollRef = useRef(null);
  const groupsScrollRef = useRef(null);
  const hierarchyScrollRef = useRef(null);

  // Loading more state
  const [loadingMore, setLoadingMore] = useState({
    categories: false,
    subcategories: false,
    groups: false,
    hierarchy: false,
  });

  // Items per batch for infinite scroll
  const batchSize = 10;
  const subcategoriesBatchSize = 15;

  // Helper functions for getting names
  const getCategoryName = useCallback(
    (categoryId) => {
      const category = categories.find((c) => c.id === categoryId);
      return category ? category.name : "Unknown";
    },
    [categories]
  );

  const getSubcategoryName = useCallback(
    (subcategoryId) => {
      const subcategory = subcategories.find((s) => s.id === subcategoryId);
      return subcategory ? subcategory.name : "Unknown";
    },
    [subcategories]
  );

  const getCategoryForSubcategory = useCallback(
    (subcategoryId) => {
      const subcategory = subcategories.find((sub) => sub.id === subcategoryId);
      if (!subcategory) return "Unknown Category";
      return getCategoryName(subcategory.category_id);
    },
    [subcategories, getCategoryName]
  );

  // Filtering functions - defined before any useEffect that uses them
  const getFilteredCategories = useCallback(() => {
    return categories.filter((category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const getFilteredSubcategories = useCallback(() => {
    return subcategories.filter((subcategory) => {
      const matchesSearch = subcategory.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        !categoryFilter || subcategory.category_id === categoryFilter;
      const matchesCategoryName = getCategoryName(subcategory.category_id)
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return (matchesSearch || matchesCategoryName) && matchesCategory;
    });
  }, [subcategories, searchQuery, categoryFilter, getCategoryName]);

  const getFilteredGroups = useCallback(() => {
    return groups.filter((group) => {
      const matchesSearch = group.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesSubcategory =
        !subcategoryFilter || group.subcategory_id === subcategoryFilter;
      const matchesSubcategoryName = getSubcategoryName(group.subcategory_id)
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return (matchesSearch || matchesSubcategoryName) && matchesSubcategory;
    });
  }, [groups, searchQuery, subcategoryFilter, getSubcategoryName]);

  // Category modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    icon: "",
    featured: false,
    description: "",
    image_url: "",
    active: true,
  });
  const [categoryImageFile, setCategoryImageFile] = useState(null);

  // Subcategory modal state
  const [subcategoryModalOpen, setSubcategoryModalOpen] = useState(false);
  const [currentSubcategory, setCurrentSubcategory] = useState(null);
  const [newSubcategory, setNewSubcategory] = useState({
    name: "",
    icon: "",
    description: "",
    category_id: "",
    featured: false,
    active: true,
    sort_order: 0,
  });

  // Group modal state
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [newGroup, setNewGroup] = useState({
    name: "",
    icon: "",
    description: "",
    subcategory_id: "",
    featured: false,
    active: true,
    sort_order: 0,
  });

  // Reset visible items when filters change
  useEffect(() => {
    const filtered = getFilteredCategories();
    setVisibleCategories(filtered.slice(0, batchSize));
  }, [searchQuery, getFilteredCategories]);

  useEffect(() => {
    const filtered = getFilteredSubcategories();
    setVisibleSubcategories(filtered.slice(0, subcategoriesBatchSize));
  }, [searchQuery, categoryFilter, getFilteredSubcategories]);

  useEffect(() => {
    const filtered = getFilteredGroups();
    setVisibleGroups(filtered.slice(0, batchSize));
  }, [searchQuery, subcategoryFilter, getFilteredGroups]);

  useEffect(() => {
    const filtered = getFilteredCategories();
    setVisibleHierarchy(filtered.slice(0, batchSize));
  }, [searchQuery, getFilteredCategories]);

  // Function to load product counts for categories
  const loadProductCounts = async (categoryList) => {
    try {
      const counts = {};
      await Promise.all(
        categoryList.map(async (category) => {
          const result = await getProductCountByCategory(category.id);
          if (result.success) {
            counts[category.id] = result.count;
          }
        })
      );
      setProductCounts(counts);
    } catch (error) {
      console.error("Error loading product counts:", error);
    }
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [categoriesResult, subcategoriesResult, groupsResult] =
          await Promise.all([
            getAllCategories(),
            getAllSubcategories(),
            getAllGroups(),
          ]);

        if (categoriesResult.success && categoriesResult.categories) {
          const categories = categoriesResult.categories;
          setCategories(categories);

          // Initialize visible categories for infinite scroll
          setVisibleCategories(categories.slice(0, batchSize));
          setVisibleHierarchy(categories.slice(0, batchSize));

          // Load product counts for categories
          await loadProductCounts(categories);
        } else {
          showNotification({
            message: categoriesResult.error || "Failed to fetch categories",
            color: "red",
          });
        }

        if (subcategoriesResult.success && subcategoriesResult.subcategories) {
          const subcategories = subcategoriesResult.subcategories;
          setSubcategories(subcategories);

          // Initialize visible subcategories for infinite scroll
          setVisibleSubcategories(
            subcategories.slice(0, subcategoriesBatchSize)
          );
        } else {
          showNotification({
            message:
              subcategoriesResult.error || "Failed to fetch subcategories",
            color: "red",
          });
        }

        if (groupsResult.success && groupsResult.groups) {
          const groups = groupsResult.groups;
          setGroups(groups);

          // Initialize visible groups for infinite scroll
          setVisibleGroups(groups.slice(0, batchSize));
        } else {
          showNotification({
            message: groupsResult.error || "Failed to fetch groups",
            color: "red",
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        showNotification({ message: "Error fetching data", color: "red" });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const toggleCategoryExpansion = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getSubcategoriesForCategory = (categoryId) => {
    return subcategories.filter((sub) => sub.category_id === categoryId);
  };

  const getGroupsForSubcategory = (subcategoryId) => {
    return groups.filter((group) => group.subcategory_id === subcategoryId);
  };

  // Helper functions moved to the top of the component

  // Text truncation utility
  const truncateText = (text, maxLength = 50) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  // Functions to load more items for infinite scroll
  const loadMoreCategories = useCallback(() => {
    setLoadingMore((prev) => ({ ...prev, categories: true }));

    // Add a small delay to simulate loading and avoid UI freezing
    setTimeout(() => {
      const filtered = getFilteredCategories();
      const currentLength = visibleCategories.length;

      if (currentLength < filtered.length) {
        const nextBatch = filtered.slice(
          currentLength,
          currentLength + batchSize
        );
        setVisibleCategories((prev) => [...prev, ...nextBatch]);
      }

      setLoadingMore((prev) => ({ ...prev, categories: false }));
    }, 300);
  }, [getFilteredCategories, visibleCategories]);

  const loadMoreSubcategories = useCallback(() => {
    setLoadingMore((prev) => ({ ...prev, subcategories: true }));

    setTimeout(() => {
      const filtered = getFilteredSubcategories();
      const currentLength = visibleSubcategories.length;

      if (currentLength < filtered.length) {
        const nextBatch = filtered.slice(
          currentLength,
          currentLength + subcategoriesBatchSize
        );
        setVisibleSubcategories((prev) => [...prev, ...nextBatch]);
      }

      setLoadingMore((prev) => ({ ...prev, subcategories: false }));
    }, 300);
  }, [getFilteredSubcategories, visibleSubcategories]);

  const loadMoreGroups = useCallback(() => {
    setLoadingMore((prev) => ({ ...prev, groups: true }));

    setTimeout(() => {
      const filtered = getFilteredGroups();
      const currentLength = visibleGroups.length;

      if (currentLength < filtered.length) {
        const nextBatch = filtered.slice(
          currentLength,
          currentLength + batchSize
        );
        setVisibleGroups((prev) => [...prev, ...nextBatch]);
      }

      setLoadingMore((prev) => ({ ...prev, groups: false }));
    }, 300);
  }, [getFilteredGroups, visibleGroups]);

  const loadMoreHierarchy = useCallback(() => {
    setLoadingMore((prev) => ({ ...prev, hierarchy: true }));

    setTimeout(() => {
      const filtered = getFilteredCategories();
      const currentLength = visibleHierarchy.length;

      if (currentLength < filtered.length) {
        const nextBatch = filtered.slice(
          currentLength,
          currentLength + batchSize
        );
        setVisibleHierarchy((prev) => [...prev, ...nextBatch]);
      }

      setLoadingMore((prev) => ({ ...prev, hierarchy: false }));
    }, 300);
  }, [getFilteredCategories, visibleHierarchy]);

  // Scroll event handlers for infinite scroll
  const handleScroll = useCallback(
    (type, ref) => {
      if (!ref.current) return;

      const { scrollTop, scrollHeight, clientHeight } = ref.current.viewport;

      // If scrolled to bottom (with a small threshold)
      if (scrollHeight - scrollTop - clientHeight < 50) {
        switch (type) {
          case "categories":
            if (!loadingMore.categories) {
              loadMoreCategories();
            }
            break;
          case "subcategories":
            if (!loadingMore.subcategories) {
              loadMoreSubcategories();
            }
            break;
          case "groups":
            if (!loadingMore.groups) {
              loadMoreGroups();
            }
            break;
          case "hierarchy":
            if (!loadingMore.hierarchy) {
              loadMoreHierarchy();
            }
            break;
          default:
            break;
        }
      }
    },
    [
      loadingMore,
      loadMoreCategories,
      loadMoreSubcategories,
      loadMoreGroups,
      loadMoreHierarchy,
    ]
  );

  // Track remaining items for each tab
  const remainingCategories =
    getFilteredCategories().length - visibleCategories.length;
  const remainingSubcategories =
    getFilteredSubcategories().length - visibleSubcategories.length;
  const remainingGroups = getFilteredGroups().length - visibleGroups.length;
  const remainingHierarchy =
    getFilteredCategories().length - visibleHierarchy.length;

  // Category management functions
  const openAddModal = () => {
    setCurrentCategory(null);
    setNewCategory({
      name: "",
      icon: "",
      featured: false,
      description: "",
      image_url: "",
      active: true,
    });
    setCategoryImageFile(null);
    setModalOpen(true);
  };

  const openEditModal = (category) => {
    setCurrentCategory(category);
    setNewCategory({ ...category });
    setCategoryImageFile(null);
    setModalOpen(true);
  };

  // Subcategory management functions
  const openAddSubcategoryModal = (categoryId = null) => {
    setCurrentSubcategory(null);
    setNewSubcategory({
      name: "",
      icon: "",
      description: "",
      category_id: categoryId || "",
      featured: false,
      active: true,
      sort_order: 0,
    });
    setSubcategoryModalOpen(true);
  };

  const openEditSubcategoryModal = (subcategory) => {
    setCurrentSubcategory(subcategory);
    setNewSubcategory({ ...subcategory });
    setSubcategoryModalOpen(true);
  };

  // Group management functions
  const openAddGroupModal = (subcategoryId = null) => {
    setCurrentGroup(null);
    setNewGroup({
      name: "",
      icon: "",
      description: "",
      subcategory_id: subcategoryId || "",
      featured: false,
      active: true,
      sort_order: 0,
    });
    setGroupModalOpen(true);
  };

  const openEditGroupModal = (group) => {
    setCurrentGroup(group);
    setNewGroup({ ...group });
    setGroupModalOpen(true);
  };

  const handleSaveCategory = async () => {
    setLoading(true);
    try {
      let result;
      if (currentCategory) {
        result = await updateCategory(
          currentCategory.id,
          newCategory,
          categoryImageFile
        );
      } else {
        result = await addCategory(newCategory, categoryImageFile);
      }
      if (result.success) {
        showNotification({
          message: "Category saved successfully",
          color: "green",
        });
        const res = await getAllCategories();
        if (res.success) {
          setCategories(res.categories);
          // Refresh product counts for new/updated categories
          await loadProductCounts(res.categories);
        }
        setModalOpen(false);
        setCategoryImageFile(null);
      } else {
        showNotification({ message: result.error, color: "red" });
      }
    } catch (error) {
      console.error("Error saving category:", error);
      showNotification({ message: "Failed to save category", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSubcategory = async () => {
    setLoading(true);
    try {
      let result;
      if (currentSubcategory) {
        result = await updateSubcategory(
          currentSubcategory.id,
          newSubcategory,
          subcategoryImageFile
        );
      } else {
        result = await addSubcategory(newSubcategory, subcategoryImageFile);
      }

      if (result.success) {
        showNotification({
          message: "Subcategory saved successfully",
          color: "green",
        });

        const res = await getAllSubcategories();
        if (res.success) setSubcategories(res.subcategories);

        // Reset form and state
        setSubcategoryImageFile(null);
        setNewSubcategory({
          name: "",
          icon: "",
          description: "",
          category_id: "",
          featured: false,
          active: true,
          sort_order: 0,
        });

        setSubcategoryModalOpen(false);
      } else {
        showNotification({ message: result.error, color: "red" });
      }
    } catch (error) {
      console.error("Error saving subcategory:", error);
      showNotification({ message: "Failed to save subcategory", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  /* for group image */
  const [groupImageFile, setGroupImageFile] = useState(null);

  const handleSaveGroup = async () => {
    setLoading(true);
    try {
      let result;
      if (currentGroup) {
        result = await updateGroup(currentGroup.id, newGroup, groupImageFile);
      } else {
        result = await addGroup(newGroup, groupImageFile);
      }
      if (result.success) {
        showNotification({
          message: "Group saved successfully",
          color: "green",
        });
        const res = await getAllGroups();
        if (res.success) setGroups(res.groups);
        setNewGroup({
          name: "",
          icon: "",
          description: "",
          subcategory_id: "",
          featured: false,
          active: true,
          sort_order: 0,
          imageFile: null, // reset image file
        });

        setGroupModalOpen(false);
      } else {
        showNotification({ message: result.error, color: "red" });
      }
    } catch (error) {
      console.error("Error saving group:", error);
      showNotification({ message: "Failed to save group", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  // Additional state for better delete handling
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleteOptions, setDeleteOptions] = useState({
    action: "cancel", // 'cancel', 'reassign', 'forceDelete'
    reassignTo: "",
  });

  const handleDeleteCategory = async (id) => {
    // First, get category info for the confirmation dialog
    const category = categories.find((cat) => cat.id === id);
    setCategoryToDelete(category);
    setDeleteOptions({ action: "cancel", reassignTo: "" });
    setDeleteConfirmModal(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    setLoading(true);
    try {
      let deleteOptionsForApi = {};

      if (deleteOptions.action === "reassign" && deleteOptions.reassignTo) {
        deleteOptionsForApi.reassignProductsTo = deleteOptions.reassignTo;
      } else if (deleteOptions.action === "forceDelete") {
        deleteOptionsForApi.forceDelete = true;
      }

      const result = await deleteCategory(
        categoryToDelete.id,
        deleteOptionsForApi
      );

      if (result.success) {
        showNotification({
          message: "Category deleted successfully",
          color: "green",
        });

        // Refresh categories data
        const categoriesRes = await getAllCategories();
        if (categoriesRes.success) {
          setCategories(categoriesRes.categories);
          // Refresh product counts
          await loadProductCounts(categoriesRes.categories);
        }

        // Refresh subcategories data if needed
        const subcategoriesRes = await getAllSubcategories();
        if (subcategoriesRes.success) {
          setSubcategories(subcategoriesRes.subcategories);
        }

        setDeleteConfirmModal(false);
        setCategoryToDelete(null);
      } else {
        if (result.hasProducts) {
          // Don't close modal, show options instead
          showNotification({
            message: result.error,
            color: "orange",
            autoClose: 8000,
          });
        } else {
          showNotification({ message: result.error, color: "red" });
          setDeleteConfirmModal(false);
          setCategoryToDelete(null);
        }
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      showNotification({ message: "Failed to delete category", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory_old = async (id) => {
    if (!window.confirm("Delete this category and all its subcategories?"))
      return;
    setLoading(true);
    try {
      const result = await deleteCategory(id);
      if (result.success) {
        showNotification({ message: "Category deleted", color: "green" });
        const res = await getAllCategories();
        if (res.success) setCategories(res.categories);
        // Refresh subcategories as well
        const subRes = await getAllSubcategories();
        if (subRes.success) setSubcategories(subRes.subcategories);
      } else {
        showNotification({ message: result.error, color: "red" });
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      showNotification({ message: "Failed to delete category", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubcategory = async (id) => {
    if (!window.confirm("Delete this subcategory?")) return;
    setLoading(true);
    try {
      const result = await deleteSubcategory(id);
      if (result.success) {
        showNotification({ message: "Subcategory deleted", color: "green" });
        const res = await getAllSubcategories();
        if (res.success) setSubcategories(res.subcategories);
      } else {
        showNotification({ message: result.error, color: "red" });
      }
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      showNotification({
        message: "Failed to delete subcategory",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (id) => {
    if (!window.confirm("Delete this group?")) return;
    setLoading(true);
    try {
      const result = await deleteGroup(id);
      if (result.success) {
        showNotification({ message: "Group deleted", color: "green" });
        const res = await getAllGroups();
        if (res.success) setGroups(res.groups);
      } else {
        showNotification({ message: result.error, color: "red" });
      }
    } catch (error) {
      console.error("Error deleting group:", error);
      showNotification({ message: "Failed to delete group", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (id) => {
    const cat = categories.find((c) => c.id === id);
    const newFeat = !cat.featured;
    setLoading(true);
    try {
      const result = await updateCategory(id, { featured: newFeat });
      if (result.success) {
        setCategories(
          categories.map((c) => (c.id === id ? { ...c, featured: newFeat } : c))
        );
      } else {
        showNotification({ message: result.error, color: "red" });
      }
    } catch (error) {
      console.error("Error toggling featured:", error);
      showNotification({ message: "Failed to update featured", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id, active) => {
    setLoading(true);
    try {
      const result = await toggleCategoryStatus(id, active);
      if (result.success) {
        setCategories(
          categories.map((cat) => (cat.id === id ? { ...cat, active } : cat))
        );
      } else {
        showNotification({ message: result.error, color: "red" });
      }
    } catch (error) {
      console.error("Error toggling active:", error);
      showNotification({ message: "Failed to update active", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 mantine-bg min-h-screen">
      <Card shadow="sm" p="lg" radius="md" className="mantine-card mb-6">
        <LoadingOverlay visible={loading} />
        <Group position="apart" className="mb-4">
          <Title order={2}>Categories & Subcategories Management</Title>
          <Group>
            <Button
              leftIcon={<FaPlus />}
              color="blue"
              variant="filled"
              onClick={openAddModal}
            >
              Add Category
            </Button>
            <Button
              leftIcon={<FaLayerGroup />}
              color="green"
              variant="filled"
              onClick={() => openAddSubcategoryModal()}
            >
              Add Subcategory
            </Button>
            <Button
              leftIcon={<FaLayerGroup />}
              color="orange"
              variant="filled"
              onClick={() => openAddGroupModal()}
            >
              Add Group
            </Button>
          </Group>
        </Group>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <TextInput
            className="flex-1"
            placeholder="Search categories, subcategories, and groups..."
            leftSection={<FaSearch />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {activeTab === "subcategories" && (
            <Select
              placeholder="Filter by Category"
              clearable
              data={[
                { value: "", label: "All Categories" },
                ...categories.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                })),
              ]}
              value={categoryFilter}
              onChange={(value) => setCategoryFilter(value || "")}
              style={{ minWidth: 200 }}
            />
          )}
          {activeTab === "groups" && (
            <Select
              placeholder="Filter by Subcategory"
              clearable
              data={[
                { value: "", label: "All Subcategories" },
                ...subcategories.map((sub) => ({
                  value: sub.id,
                  label: `${sub.name} (${getCategoryName(sub.category_id)})`,
                })),
              ]}
              value={subcategoryFilter}
              onChange={(value) => setSubcategoryFilter(value || "")}
              style={{ minWidth: 250 }}
            />
          )}
        </div>

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="categories" leftSection={<FaTag />}>
              Categories ({getFilteredCategories().length})
            </Tabs.Tab>
            <Tabs.Tab value="subcategories" leftSection={<FaLayerGroup />}>
              Subcategories ({getFilteredSubcategories().length})
            </Tabs.Tab>
            <Tabs.Tab value="groups" leftSection={<FaLayerGroup />}>
              Groups ({getFilteredGroups().length})
            </Tabs.Tab>
            <Tabs.Tab value="hierarchy" leftSection={<FaLayerGroup />}>
              Category Hierarchy
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="categories" pt="xs">
            <ScrollArea
              h={550}
              type="scroll"
              className="scroll-area-custom"
              ref={categoriesScrollRef}
              onScrollPositionChange={() =>
                handleScroll("categories", categoriesScrollRef)
              }
            >
              <div className="overflow-x-auto">
                <Table striped highlightOnHover className="categories-table">
                  <thead className="dark:bg-gray-800">
                    <tr>
                      <th
                        style={{ width: "60px", textAlign: "center" }}
                        className="dark:text-gray-200"
                      >
                        Icon
                      </th>
                      <th
                        style={{ width: "150px" }}
                        className="dark:text-gray-200"
                      >
                        Name
                      </th>
                      <th
                        style={{ width: "250px" }}
                        className="dark:text-gray-200"
                      >
                        Description
                      </th>
                      <th
                        style={{ width: "100px", textAlign: "center" }}
                        className="dark:text-gray-200"
                      >
                        Image
                      </th>
                      <th
                        style={{ width: "120px", textAlign: "center" }}
                        className="dark:text-gray-200"
                      >
                        Subcategories
                      </th>
                      <th
                        style={{ width: "100px", textAlign: "center" }}
                        className="dark:text-gray-200"
                      >
                        Products
                      </th>
                      <th
                        style={{ width: "100px", textAlign: "center" }}
                        className="dark:text-gray-200"
                      >
                        Featured
                      </th>
                      <th
                        style={{ width: "80px", textAlign: "center" }}
                        className="dark:text-gray-200"
                      >
                        Active
                      </th>
                      <th
                        style={{ width: "140px", textAlign: "center" }}
                        className="dark:text-gray-200"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleCategories.map((category) => (
                      <tr
                        key={category.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td style={{ textAlign: "center", width: "60px" }}>
                          <span className="text-2xl">{category.icon}</span>
                        </td>
                        <td style={{ width: "150px" }}>
                          <Tooltip
                            label={category.name}
                            disabled={category.name?.length <= 20}
                          >
                            <Text
                              weight={600}
                              size="sm"
                              truncate
                              className="dark:text-gray-200"
                            >
                              {category.name}
                            </Text>
                          </Tooltip>
                        </td>
                        <td style={{ width: "250px" }}>
                          <Tooltip
                            label={category.description}
                            disabled={
                              !category.description ||
                              category.description.length <= 50
                            }
                          >
                            <Text
                              size="sm"
                              color="dimmed"
                              truncate
                              className="dark:text-gray-400"
                            >
                              {truncateText(category.description, 50)}
                            </Text>
                          </Tooltip>
                        </td>
                        <td style={{ textAlign: "center", width: "100px" }}>
                          {category.image_url && (
                            <Image
                              src={category.image_url}
                              alt={category.name}
                              style={{
                                width: 50,
                                height: 50,
                                objectFit: "cover",
                                margin: "0 auto",
                              }}
                              radius="sm"
                            />
                          )}
                        </td>
                        <td style={{ textAlign: "center", width: "120px" }}>
                          <Badge
                            color="blue"
                            variant="light"
                            size="sm"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setActiveTab("subcategories");
                              setSearchQuery(category.name);
                            }}
                          >
                            {getSubcategoriesForCategory(category.id).length}
                          </Badge>
                        </td>
                        <td style={{ textAlign: "center", width: "100px" }}>
                          <Badge
                            color="orange"
                            variant="light"
                            size="sm"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              // Could navigate to products view filtered by this category
                              console.log(
                                `View products for category ${category.id}`
                              );
                            }}
                          >
                            {productCounts[category.id] || 0}
                          </Badge>
                        </td>
                        <td style={{ textAlign: "center", width: "100px" }}>
                          <Badge
                            color={category.featured ? "green" : "gray"}
                            variant={category.featured ? "filled" : "light"}
                            size="sm"
                            className="cursor-pointer"
                            onClick={() => toggleFeatured(category.id)}
                          >
                            {category.featured ? "Yes" : "No"}
                          </Badge>
                        </td>
                        <td style={{ textAlign: "center", width: "80px" }}>
                          <Switch
                            checked={category.active}
                            onChange={() =>
                              handleToggleActive(category.id, !category.active)
                            }
                            size="sm"
                          />
                        </td>
                        <td style={{ textAlign: "center", width: "140px" }}>
                          <Group spacing={4} position="center">
                            <Tooltip label="Add Subcategory">
                              <ActionIcon
                                color="green"
                                size="sm"
                                onClick={() =>
                                  openAddSubcategoryModal(category.id)
                                }
                              >
                                <FaPlus size={12} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Edit Category">
                              <ActionIcon
                                color="blue"
                                size="sm"
                                onClick={() => openEditModal(category)}
                              >
                                <FaEdit size={12} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Delete Category">
                              <ActionIcon
                                color="red"
                                size="sm"
                                onClick={() =>
                                  handleDeleteCategory(category.id)
                                }
                              >
                                <FaTrash size={12} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                {visibleCategories.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <Text size="md" color="dimmed">
                      {searchQuery
                        ? `No categories found for "${searchQuery}"`
                        : "No categories available"}
                    </Text>
                  </div>
                )}
                {loadingMore.categories && (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      <Center>
                        <Loader size="sm" />
                        <Text size="sm" color="dimmed" ml={10}>
                          Loading more categories...
                        </Text>
                      </Center>
                    </td>
                  </tr>
                )}
                {!loadingMore.categories && remainingCategories > 0 && (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      <Button
                        variant="subtle"
                        onClick={loadMoreCategories}
                        compact
                      >
                        Load {Math.min(batchSize, remainingCategories)} more (
                        {remainingCategories} remaining)
                      </Button>
                    </td>
                  </tr>
                )}
              </div>
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="subcategories" pt="xs">
            <ScrollArea
              h={550}
              type="scroll"
              className="scroll-area-custom"
              ref={subcategoriesScrollRef}
              onScrollPositionChange={() =>
                handleScroll("subcategories", subcategoriesScrollRef)
              }
            >
              <div className="overflow-x-auto">
                <Table striped highlightOnHover className="categories-table">
                  <thead className="dark:bg-gray-800">
                    <tr>
                      <th
                        style={{ width: "60px", textAlign: "center" }}
                        className="dark:text-gray-200"
                      >
                        Image
                      </th>
                      <th
                        style={{ width: "150px" }}
                        className="dark:text-gray-200"
                      >
                        Name
                      </th>
                      <th
                        style={{ width: "140px" }}
                        className="dark:text-gray-200"
                      >
                        Category
                      </th>
                      <th
                        style={{ width: "200px" }}
                        className="dark:text-gray-200"
                      >
                        Description
                      </th>
                      <th
                        style={{ width: "80px", textAlign: "center" }}
                        className="dark:text-gray-200"
                      >
                        Sort
                      </th>
                      <th
                        style={{ width: "90px", textAlign: "center" }}
                        className="dark:text-gray-200"
                      >
                        Featured
                      </th>
                      <th
                        style={{ width: "80px", textAlign: "center" }}
                        className="dark:text-gray-200"
                      >
                        Active
                      </th>
                      <th
                        style={{ width: "120px", textAlign: "center" }}
                        className="dark:text-gray-200"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleSubcategories.map((subcategory) => (
                      <tr
                        key={subcategory.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td style={{ textAlign: "center", width: "60px" }}>
                          {subcategory.image_url ? (
                            <img
                              src={subcategory.image_url}
                              className="h-10 w-20 cursor-pointer rounded"
                              onClick={() => {
                                setPreviewSubcategoryImage(
                                  subcategory.image_url
                                );
                                setSubcategoryImageModalOpen(true);
                              }}
                              alt="Subcategory"
                            />
                          ) : (
                            <Text size="xs" color="dimmed">
                              No image
                            </Text>
                          )}
                        </td>

                        <td style={{ width: "150px" }}>
                          <Tooltip
                            label={subcategory.name}
                            disabled={subcategory.name?.length <= 20}
                          >
                            <Text
                              weight={600}
                              size="sm"
                              truncate
                              className="dark:text-gray-200"
                            >
                              {subcategory.name}
                            </Text>
                          </Tooltip>
                        </td>
                        <td style={{ width: "140px" }}>
                          <Badge color="blue" variant="light" size="sm">
                            <Tooltip
                              label={getCategoryName(subcategory.category_id)}
                              disabled={
                                getCategoryName(subcategory.category_id)
                                  .length <= 15
                              }
                            >
                              <span>
                                {truncateText(
                                  getCategoryName(subcategory.category_id),
                                  15
                                )}
                              </span>
                            </Tooltip>
                          </Badge>
                        </td>
                        <td style={{ width: "200px" }}>
                          <Tooltip
                            label={subcategory.description}
                            disabled={
                              !subcategory.description ||
                              subcategory.description.length <= 40
                            }
                          >
                            <Text
                              size="sm"
                              color="dimmed"
                              truncate
                              className="dark:text-gray-400"
                            >
                              {truncateText(subcategory.description, 40)}
                            </Text>
                          </Tooltip>
                        </td>
                        <td style={{ textAlign: "center", width: "80px" }}>
                          <Text size="sm" className="dark:text-gray-300">
                            {subcategory.sort_order}
                          </Text>
                        </td>
                        <td style={{ textAlign: "center", width: "90px" }}>
                          <Badge
                            color={subcategory.featured ? "green" : "gray"}
                            variant={subcategory.featured ? "filled" : "light"}
                            size="sm"
                          >
                            {subcategory.featured ? "Yes" : "No"}
                          </Badge>
                        </td>
                        <td style={{ textAlign: "center", width: "80px" }}>
                          <Badge
                            color={subcategory.active ? "green" : "red"}
                            variant="light"
                            size="sm"
                          >
                            {subcategory.active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td style={{ textAlign: "center", width: "120px" }}>
                          <Group spacing={4} position="center">
                            <Tooltip label="Edit Subcategory">
                              <ActionIcon
                                color="blue"
                                size="sm"
                                onClick={() =>
                                  openEditSubcategoryModal(subcategory)
                                }
                              >
                                <FaEdit size={12} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Delete Subcategory">
                              <ActionIcon
                                color="red"
                                size="sm"
                                onClick={() =>
                                  handleDeleteSubcategory(subcategory.id)
                                }
                              >
                                <FaTrash size={12} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                {visibleSubcategories.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <Text size="md" color="dimmed">
                      {searchQuery || categoryFilter
                        ? `No subcategories found`
                        : "No subcategories available"}
                    </Text>
                  </div>
                )}
                {loadingMore.subcategories && (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <Center>
                        <Loader size="sm" />
                        <Text size="sm" color="dimmed" ml={10}>
                          Loading more subcategories...
                        </Text>
                      </Center>
                    </td>
                  </tr>
                )}
                {!loadingMore.subcategories && remainingSubcategories > 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <Button
                        variant="subtle"
                        onClick={loadMoreSubcategories}
                        compact
                      >
                        Load{" "}
                        {Math.min(
                          subcategoriesBatchSize,
                          remainingSubcategories
                        )}{" "}
                        more ({remainingSubcategories} remaining)
                      </Button>
                    </td>
                  </tr>
                )}
              </div>
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="groups" pt="xs">
            <ScrollArea
              h={550}
              type="scroll"
              className="scroll-area-custom"
              ref={groupsScrollRef}
              onScrollPositionChange={() =>
                handleScroll("groups", groupsScrollRef)
              }
            >
              <div className="overflow-x-auto">
                <Table striped highlightOnHover className="categories-table">
                  <thead className="dark:bg-gray-800">
                    <tr>
                      <th
                        style={{ width: "60px", textAlign: "center" }}
                        className="dark:text-gray-200"
                      >
                        Image
                      </th>
                      <th
                        style={{ width: "150px" }}
                        className="dark:text-gray-200"
                      >
                        Name
                      </th>
                      <th
                        style={{ width: "140px" }}
                        className="dark:text-gray-200"
                      >
                        Subcategory
                      </th>
                      <th
                        style={{ width: "200px" }}
                        className="dark:text-gray-200"
                      >
                        Description
                      </th>
                      <th
                        style={{ width: "80px", textAlign: "center" }}
                        className="dark:text-gray-200"
                      >
                        Sort
                      </th>
                      <th
                        style={{ width: "90px", textAlign: "center" }}
                        className="dark:text-gray-200"
                      >
                        Featured
                      </th>
                      <th
                        style={{ width: "80px", textAlign: "center" }}
                        className="dark:text-gray-200"
                      >
                        Active
                      </th>
                      <th
                        style={{ width: "120px", textAlign: "center" }}
                        className="dark:text-gray-200"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleGroups.map((group) => (
                      <tr
                        key={group.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td style={{ textAlign: "center", width: "60px" }}>
                          <img
                            src={group.image_url}
                            alt="Group"
                            className="h-10 w-20 cursor-pointer rounded"
                            onClick={() => {
                              setPreviewImageUrl(group.image_url);
                              setImageModalOpen(true);
                            }}
                          />
                        </td>

                        <td style={{ width: "150px" }}>
                          <Tooltip
                            label={group.name}
                            disabled={group.name?.length <= 20}
                          >
                            <Text
                              weight={600}
                              size="sm"
                              truncate
                              className="dark:text-gray-200"
                            >
                              {group.name}
                            </Text>
                          </Tooltip>
                        </td>
                        <td style={{ width: "140px" }}>
                          <Badge color="blue" variant="light" size="sm">
                            <Tooltip
                              label={getSubcategoryName(group.subcategory_id)}
                              disabled={
                                getSubcategoryName(group.subcategory_id)
                                  .length <= 15
                              }
                            >
                              <span>
                                {truncateText(
                                  getSubcategoryName(group.subcategory_id),
                                  15
                                )}
                              </span>
                            </Tooltip>
                          </Badge>
                        </td>
                        <td style={{ width: "200px" }}>
                          <Tooltip
                            label={group.description}
                            disabled={
                              !group.description ||
                              group.description.length <= 40
                            }
                          >
                            <Text
                              size="sm"
                              color="dimmed"
                              truncate
                              className="dark:text-gray-400"
                            >
                              {truncateText(group.description, 40)}
                            </Text>
                          </Tooltip>
                        </td>
                        <td style={{ textAlign: "center", width: "80px" }}>
                          <Text size="sm" className="dark:text-gray-300">
                            {group.sort_order}
                          </Text>
                        </td>
                        <td style={{ textAlign: "center", width: "90px" }}>
                          <Badge
                            color={group.featured ? "green" : "gray"}
                            variant={group.featured ? "filled" : "light"}
                            size="sm"
                          >
                            {group.featured ? "Yes" : "No"}
                          </Badge>
                        </td>
                        <td style={{ textAlign: "center", width: "80px" }}>
                          <Badge
                            color={group.active ? "green" : "red"}
                            variant="light"
                            size="sm"
                          >
                            {group.active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td style={{ textAlign: "center", width: "120px" }}>
                          <Group spacing={4} position="center">
                            <Tooltip label="Edit Group">
                              <ActionIcon
                                color="blue"
                                size="sm"
                                onClick={() => openEditGroupModal(group)}
                              >
                                <FaEdit size={12} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Delete Group">
                              <ActionIcon
                                color="red"
                                size="sm"
                                onClick={() => handleDeleteGroup(group.id)}
                              >
                                <FaTrash size={12} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                {visibleGroups.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <Text size="md" color="dimmed">
                      {searchQuery || subcategoryFilter
                        ? `No groups found`
                        : "No groups available"}
                    </Text>
                  </div>
                )}
                {loadingMore.groups && (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <Center>
                        <Loader size="sm" />
                        <Text size="sm" color="dimmed" ml={10}>
                          Loading more groups...
                        </Text>
                      </Center>
                    </td>
                  </tr>
                )}
                {!loadingMore.groups && remainingGroups > 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <Button variant="subtle" onClick={loadMoreGroups} compact>
                        Load {Math.min(batchSize, remainingGroups)} more (
                        {remainingGroups} remaining)
                      </Button>
                    </td>
                  </tr>
                )}
              </div>
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="hierarchy" pt="xs">
            <ScrollArea
              h={550}
              type="scroll"
              className="scroll-area-custom"
              ref={hierarchyScrollRef}
              onScrollPositionChange={() =>
                handleScroll("hierarchy", hierarchyScrollRef)
              }
            >
              <div className="space-y-4">
                {visibleHierarchy.map((category) => {
                  const categorySubcategories = getSubcategoriesForCategory(
                    category.id
                  );
                  const isExpanded = expandedCategories.has(category.id);

                  return (
                    <Card key={category.id} shadow="sm" radius="md" withBorder>
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <ActionIcon
                            variant="subtle"
                            onClick={() => toggleCategoryExpansion(category.id)}
                          >
                            {isExpanded ? (
                              <FaChevronDown />
                            ) : (
                              <FaChevronRight />
                            )}
                          </ActionIcon>
                          <span className="text-2xl">{category.icon}</span>
                          <div>
                            <Text weight={500}>{category.name}</Text>
                            <Text size="sm" color="dimmed">
                              {categorySubcategories.length} subcategories
                            </Text>
                          </div>
                        </div>
                        <Group spacing={8}>
                          <Button
                            size="xs"
                            color="green"
                            leftIcon={<FaPlus />}
                            onClick={() => openAddSubcategoryModal(category.id)}
                          >
                            Add Subcategory
                          </Button>
                          <ActionIcon
                            color="blue"
                            onClick={() => openEditModal(category)}
                          >
                            <FaEdit size={16} />
                          </ActionIcon>
                        </Group>
                      </div>

                      {isExpanded && (
                        <div className="px-4 pb-4">
                          {categorySubcategories.length === 0 ? (
                            <Text
                              color="dimmed"
                              size="sm"
                              className="py-4 text-center"
                            >
                              No subcategories yet. Click "Add Subcategory" to
                              create one.
                            </Text>
                          ) : (
                            <div className="space-y-3">
                              {categorySubcategories.map((subcategory) => {
                                const subcategoryGroups =
                                  getGroupsForSubcategory(subcategory.id);
                                return (
                                  <Card
                                    key={subcategory.id}
                                    shadow="xs"
                                    radius="sm"
                                    withBorder
                                  >
                                    <div className="p-3">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <span className="text-lg">
                                            {subcategory.icon}
                                          </span>
                                          <div>
                                            <Text size="sm" weight={500}>
                                              {subcategory.name}
                                            </Text>
                                            <Text size="xs" color="dimmed">
                                              {subcategoryGroups.length} groups
                                            </Text>
                                            {subcategory.featured && (
                                              <Badge size="xs" color="yellow">
                                                Featured
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                        <Group spacing={4}>
                                          <Button
                                            size="xs"
                                            color="teal"
                                            leftIcon={<FaPlus />}
                                            onClick={() =>
                                              openAddGroupModal(subcategory.id)
                                            }
                                          >
                                            Add Group
                                          </Button>
                                          <ActionIcon
                                            size="sm"
                                            color="blue"
                                            onClick={() =>
                                              openEditSubcategoryModal(
                                                subcategory
                                              )
                                            }
                                          >
                                            <FaEdit size={12} />
                                          </ActionIcon>
                                          <ActionIcon
                                            size="sm"
                                            color="red"
                                            onClick={() =>
                                              handleDeleteSubcategory(
                                                subcategory.id
                                              )
                                            }
                                          >
                                            <FaTrash size={12} />
                                          </ActionIcon>
                                        </Group>
                                      </div>

                                      {/* Groups display */}
                                      {subcategoryGroups.length > 0 && (
                                        <div className="mt-3 pl-6 border-l-2 border-gray-200">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {subcategoryGroups.map((group) => (
                                              <div
                                                key={group.id}
                                                className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                              >
                                                <div className="flex items-center gap-2">
                                                  <span className="text-sm">
                                                    {group.icon}
                                                  </span>
                                                  <div>
                                                    <Text
                                                      size="xs"
                                                      weight={500}
                                                    >
                                                      {group.name}
                                                    </Text>
                                                    {group.featured && (
                                                      <Badge
                                                        size="xs"
                                                        color="blue"
                                                      >
                                                        Featured
                                                      </Badge>
                                                    )}
                                                  </div>
                                                </div>
                                                <Group spacing={2}>
                                                  <ActionIcon
                                                    size="xs"
                                                    color="blue"
                                                    onClick={() =>
                                                      openEditGroupModal(group)
                                                    }
                                                  >
                                                    <FaEdit size={10} />
                                                  </ActionIcon>
                                                  <ActionIcon
                                                    size="xs"
                                                    color="red"
                                                    onClick={() =>
                                                      handleDeleteGroup(
                                                        group.id
                                                      )
                                                    }
                                                  >
                                                    <FaTrash size={10} />
                                                  </ActionIcon>
                                                </Group>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </Card>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
                {loadingMore.hierarchy && (
                  <div className="text-center py-4">
                    <Center>
                      <Loader size="sm" />
                      <Text size="sm" color="dimmed" ml={10}>
                        Loading more categories...
                      </Text>
                    </Center>
                  </div>
                )}
                {!loadingMore.hierarchy && remainingHierarchy > 0 && (
                  <div className="text-center py-4">
                    <Button
                      variant="subtle"
                      onClick={loadMoreHierarchy}
                      compact
                    >
                      Load {Math.min(batchSize, remainingHierarchy)} more (
                      {remainingHierarchy} remaining)
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Tabs.Panel>
        </Tabs>
      </Card>

      {/* Add/Edit Category Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={currentCategory ? "Edit Category" : "Add New Category"}
        size="md"
      >
        <div className="flex flex-col gap-4">
          <TextInput
            label="Category Name"
            placeholder="Enter category name"
            required
            value={newCategory.name}
            onChange={(e) =>
              setNewCategory({ ...newCategory, name: e.target.value })
            }
          />

          <TextInput
            label="Category Icon (Emoji)"
            placeholder="Enter emoji (e.g., 📱, 👕, 🏠)"
            value={newCategory.icon}
            onChange={(e) =>
              setNewCategory({ ...newCategory, icon: e.target.value })
            }
            description="Enter a single emoji to represent this category"
          />

          <FileInput
            label="Category Image"
            placeholder="Upload category image"
            accept="image/*"
            value={categoryImageFile}
            onChange={setCategoryImageFile}
            description="Upload an image file for this category"
          />

          {newCategory.image_url && !categoryImageFile && (
            <div>
              <Text size="sm" color="dimmed" mb={5}>
                Current Image:
              </Text>
              <Image
                src={newCategory.image_url}
                alt={newCategory.name}
                style={{ width: 100, height: 60, objectFit: "cover" }}
                radius="sm"
              />
            </div>
          )}

          <Textarea
            label="Description"
            placeholder="Enter category description"
            minRows={3}
            value={newCategory.description || ""}
            onChange={(e) =>
              setNewCategory({ ...newCategory, description: e.target.value })
            }
          />

          <div className="flex items-center mb-2">
            <Switch
              label="Featured Category"
              checked={newCategory.featured}
              onChange={(event) =>
                setNewCategory({
                  ...newCategory,
                  featured: event.currentTarget.checked,
                })
              }
              color="green"
            />
          </div>

          <div className="flex items-center mb-2">
            <Switch
              label="Active Category"
              checked={newCategory.active}
              onChange={(event) =>
                setNewCategory({
                  ...newCategory,
                  active: event.currentTarget.checked,
                })
              }
              color="green"
            />
          </div>

          <Group position="right" spacing="md" className="mt-4">
            <Button variant="default" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button color="blue" onClick={handleSaveCategory}>
              {currentCategory ? "Update Category" : "Add Category"}
            </Button>
          </Group>
        </div>
      </Modal>

      {/* Add/Edit Subcategory Modal */}
      <Modal
        opened={subcategoryModalOpen}
        onClose={() => setSubcategoryModalOpen(false)}
        title={currentSubcategory ? "Edit Subcategory" : "Add New Subcategory"}
        size="md"
      >
        <div className="flex flex-col gap-4">
          <TextInput
            label="Subcategory Name"
            placeholder="Enter subcategory name"
            required
            value={newSubcategory.name}
            onChange={(e) =>
              setNewSubcategory({ ...newSubcategory, name: e.target.value })
            }
          />

          <Select
            label="Parent Category"
            placeholder="Select parent category"
            required
            data={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
            value={newSubcategory.category_id}
            onChange={(value) =>
              setNewSubcategory({ ...newSubcategory, category_id: value })
            }
          />

          <TextInput
            label="Subcategory Icon (Emoji)"
            placeholder="Enter emoji (e.g., 📱, 👕, 🏠)"
            value={newSubcategory.icon}
            onChange={(e) =>
              setNewSubcategory({ ...newSubcategory, icon: e.target.value })
            }
            description="Enter a single emoji to represent this subcategory"
          />

          <FileInput
            label="Upload Subcategory Image"
            placeholder="Upload image"
            accept="image/*"
            onChange={setSubcategoryImageFile}
            value={subcategoryImageFile}
            clearable
          />

          <Textarea
            label="Description"
            placeholder="Enter subcategory description"
            minRows={2}
            value={newSubcategory.description || ""}
            onChange={(e) =>
              setNewSubcategory({
                ...newSubcategory,
                description: e.target.value,
              })
            }
          />

          <TextInput
            label="Sort Order"
            placeholder="Enter sort order (0-999)"
            type="number"
            value={newSubcategory.sort_order}
            onChange={(e) =>
              setNewSubcategory({
                ...newSubcategory,
                sort_order: parseInt(e.target.value) || 0,
              })
            }
            description="Lower numbers appear first"
          />

          <div className="flex items-center mb-2">
            <Switch
              label="Featured Subcategory"
              checked={newSubcategory.featured}
              onChange={(event) =>
                setNewSubcategory({
                  ...newSubcategory,
                  featured: event.currentTarget.checked,
                })
              }
              color="green"
            />
          </div>

          <div className="flex items-center mb-2">
            <Switch
              label="Active Subcategory"
              checked={newSubcategory.active}
              onChange={(event) =>
                setNewSubcategory({
                  ...newSubcategory,
                  active: event.currentTarget.checked,
                })
              }
              color="green"
            />
          </div>

          <Group position="right" spacing="md" className="mt-4">
            <Button
              variant="default"
              onClick={() => setSubcategoryModalOpen(false)}
            >
              Cancel
            </Button>
            <Button color="green" onClick={handleSaveSubcategory}>
              {currentSubcategory ? "Update Subcategory" : "Add Subcategory"}
            </Button>
          </Group>
        </div>
      </Modal>

      {/* Add/Edit Group Modal */}
      <Modal
        opened={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        title={currentGroup ? "Edit Group" : "Add New Group"}
        size="md"
      >
        <div className="flex flex-col gap-4">
          <TextInput
            label="Group Name"
            placeholder="Enter group name"
            required
            value={newGroup.name}
            onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
          />

          <Select
            label="Parent Subcategory"
            placeholder="Select parent subcategory"
            required
            data={subcategories.map((sub) => ({
              value: sub.id,
              label: sub.name,
            }))}
            value={newGroup.subcategory_id}
            onChange={(value) =>
              setNewGroup({ ...newGroup, subcategory_id: value })
            }
          />

          <TextInput
            label="Group Icon (Emoji)"
            placeholder="Enter emoji (e.g., 📱, 👕, 🏠)"
            value={newGroup.icon}
            onChange={(e) => setNewGroup({ ...newGroup, icon: e.target.value })}
            description="Enter a single emoji to represent this group"
          />

          <FileInput
            label="Group Image"
            placeholder="Upload group image"
            value={groupImageFile}
            onChange={setGroupImageFile}
            accept="image/*"
          />

          {currentGroup?.image_url && !newGroup.imageFile && (
            <Image
              src={currentGroup.image_url}
              alt="Group"
              height={80}
              radius="md"
              className="mt-2"
            />
          )}

          <Textarea
            label="Description"
            placeholder="Enter group description"
            minRows={2}
            value={newGroup.description || ""}
            onChange={(e) =>
              setNewGroup({ ...newGroup, description: e.target.value })
            }
          />

          <TextInput
            label="Sort Order"
            placeholder="Enter sort order (0-999)"
            type="number"
            value={newGroup.sort_order}
            onChange={(e) =>
              setNewGroup({
                ...newGroup,
                sort_order: parseInt(e.target.value) || 0,
              })
            }
            description="Lower numbers appear first"
          />

          <div className="flex items-center mb-2">
            <Switch
              label="Featured Group"
              checked={newGroup.featured}
              onChange={(event) =>
                setNewGroup({
                  ...newGroup,
                  featured: event.currentTarget.checked,
                })
              }
              color="green"
            />
          </div>

          <div className="flex items-center mb-2">
            <Switch
              label="Active Group"
              checked={newGroup.active}
              onChange={(event) =>
                setNewGroup({
                  ...newGroup,
                  active: event.currentTarget.checked,
                })
              }
              color="green"
            />
          </div>

          <Group position="right" spacing="md" className="mt-4">
            <Button variant="default" onClick={() => setGroupModalOpen(false)}>
              Cancel
            </Button>
            <Button color="purple" onClick={handleSaveGroup}>
              {currentGroup ? "Update Group" : "Add Group"}
            </Button>
          </Group>
        </div>
      </Modal>

      {/* Delete Category Confirmation Modal */}
      <Modal
        opened={deleteConfirmModal}
        onClose={() => {
          setDeleteConfirmModal(false);
          setCategoryToDelete(null);
          setDeleteOptions({ action: "cancel", reassignTo: "" });
        }}
        title={`Delete Category: ${categoryToDelete?.name || ""}`}
        size="md"
      >
        <div className="flex flex-col gap-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Warning: This action cannot be undone
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    You are about to delete the category "
                    {categoryToDelete?.name}". This will also delete all its
                    subcategories and groups.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Text size="sm" weight={500}>
              What should happen to products in this category?
            </Text>

            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="cancel"
                  name="deleteAction"
                  value="cancel"
                  checked={deleteOptions.action === "cancel"}
                  onChange={(e) =>
                    setDeleteOptions({
                      ...deleteOptions,
                      action: e.target.value,
                    })
                  }
                  className="mr-2"
                />
                <label htmlFor="cancel" className="text-sm">
                  Cancel deletion (check products first)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="radio"
                  id="reassign"
                  name="deleteAction"
                  value="reassign"
                  checked={deleteOptions.action === "reassign"}
                  onChange={(e) =>
                    setDeleteOptions({
                      ...deleteOptions,
                      action: e.target.value,
                    })
                  }
                  className="mr-2"
                />
                <label htmlFor="reassign" className="text-sm">
                  Move products to another category
                </label>
              </div>

              {deleteOptions.action === "reassign" && (
                <div className="ml-6">
                  <Select
                    placeholder="Select target category"
                    data={categories
                      .filter((cat) => cat.id !== categoryToDelete?.id)
                      .map((cat) => ({ value: cat.id, label: cat.name }))}
                    value={deleteOptions.reassignTo}
                    onChange={(value) =>
                      setDeleteOptions({ ...deleteOptions, reassignTo: value })
                    }
                    required
                  />
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="radio"
                  id="forceDelete"
                  name="deleteAction"
                  value="forceDelete"
                  checked={deleteOptions.action === "forceDelete"}
                  onChange={(e) =>
                    setDeleteOptions({
                      ...deleteOptions,
                      action: e.target.value,
                    })
                  }
                  className="mr-2"
                />
                <label htmlFor="forceDelete" className="text-sm text-red-600">
                  Delete category and all its products (⚠️ Cannot be undone)
                </label>
              </div>
            </div>
          </div>

          <Group position="right" spacing="md" className="mt-6">
            <Button
              variant="default"
              onClick={() => {
                setDeleteConfirmModal(false);
                setCategoryToDelete(null);
                setDeleteOptions({ action: "cancel", reassignTo: "" });
              }}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={confirmDeleteCategory}
              disabled={
                deleteOptions.action === "reassign" && !deleteOptions.reassignTo
              }
            >
              {deleteOptions.action === "forceDelete"
                ? "Delete Category & Products"
                : deleteOptions.action === "reassign"
                ? "Delete Category & Move Products"
                : "Check & Delete"}
            </Button>
          </Group>
        </div>
      </Modal>
      {/* Group Image Modal */}
      <Modal
        opened={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        title="Image Preview"
        centered
        size="auto"
        withCloseButton
      >
        <img
          src={previewImageUrl}
          alt="Preview"
          className="max-h-[500px] w-auto mx-auto rounded shadow"
          style={{ objectFit: "contain" }}
        />
      </Modal>

      {/* Subcategory Image Modal */}
      <Modal
        opened={subcategoryImageModalOpen}
        onClose={() => setSubcategoryImageModalOpen(false)}
        title="Image Preview"
        centered
        size="auto"
        withCloseButton
      >
        <img
          src={previewSubcategoryImage}
          alt="Subcategory"
          className="max-h-[500px] w-auto mx-auto rounded shadow"
          style={{ objectFit: "contain" }}
        />
      </Modal>
    </div>
  );
};

export default CategoriesPage;
