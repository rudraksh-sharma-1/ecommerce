import React, { useState, useEffect } from "react";
import supabase from "../../utils/supabase";
import { useNavigate } from "react-router-dom";


import { 
  Card, 
  Title, 
  Text, 
  Table, 
  ActionIcon, 
  Group, 
  Badge, 
  Button, 
  TextInput, 
  Select, 
  Pagination,
  Modal,
  Textarea,
  NumberInput,
  FileInput,
  Switch
} from "@mantine/core";
import { 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaSearch,
  FaUpload,
  FaTag
} from "react-icons/fa";

// Empty product array - will be populated from Firebase

// Format price to Indian Rupees
const formatIndianPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
};

import { getAllProducts, addProduct, updateProduct, deleteProduct, getAllCategories, getAllSubcategories, getAllGroups } from '../../utils/supabaseApi';
import { formatDateOnlyIST } from '../../utils/dateUtils';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [subcategoryFilter, setSubcategoryFilter] = useState(null);
  const [groupFilter, setGroupFilter] = useState(null);
  const [activeFilter, setStatusFilter] = useState(null);
  const [activePage, setActivePage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredSubcategory, setHoveredSubcategory] = useState(null);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [subcategorySearchQuery, setSubcategorySearchQuery] = useState("");
  const [groupSearchQuery, setGroupSearchQuery] = useState("");
  const [groupColumnSearchQuery, setGroupColumnSearchQuery] = useState("");

  const [displayedItems, setDisplayedItems] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    category_id: "",
    subcategory_id: "",
    group_id: "",
    stock: 0,
    active: true,
    description: "",
    image: null,
    old_price: 0,
    discount: 0,
    in_stock: true,
    rating: 0,
    review_count: 0,
    featured: false,
    popular: false
  });
  const itemsPerPage = 10;
  const itemsPerLoad = 10;

  // Check authentication on component mount
  useEffect(() => {
    async function getProducts() {
      const { data: products, error } = await supabase.from('products').select();
      if (error) {
        setError(error.message);
      } else if (products && products.length > 0) {
        setProducts(products);
      }
      setLoading(false);
    }
    getProducts();
    // Supabase auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/login");
      } else {
        fetchProducts();
        fetchCategories();
        fetchSubcategories();
        fetchGroups();
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  
  // Fetch products from Supabase
  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Fetch with join to groups, subcategories and categories
      const { data, error } = await supabase
        .from('products')
        .select(`
          *, 
          groups(id, name, subcategories(id, name, categories(id, name))),
          subcategories(id, name, categories(id, name))
        `)
        .order('created_at', { ascending: false });
      if (error) {
        setError(error.message);
      } else {
        setProducts(data || []);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch subcategories for dropdown
  const fetchSubcategories = async () => {
    try {
      const result = await getAllSubcategories();
      if (result.success) {
        setSubcategories(result.subcategories || []);
      } else {
        console.error("Error fetching subcategories:", result.error);
      }
    } catch (err) {
      console.error("Error fetching subcategories:", err);
    }
  };

  // Fetch groups for dropdown
  const fetchGroups = async () => {
    try {
      const result = await getAllGroups();
      if (result.success) {
        setGroups(result.groups || []);
      } else {
        console.error("Error fetching groups:", result.error);
      }
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  // Fetch categories for dropdown
  const fetchCategories = async () => {
    try {
      const result = await getAllCategories();
      if (result.success) {
        setCategories(result.categories || []);
      } else {
        console.error("Error fetching categories:", result.error);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filtering - check both direct subcategory relation and group relation
    let matchesCategory = !categoryFilter;
    if (categoryFilter && !matchesCategory) {
      // Check through subcategory relation
      if (product.subcategories?.categories?.id === categoryFilter) {
        matchesCategory = true;
      }
      // Check through group->subcategory relation
      if (product.groups?.subcategories?.categories?.id === categoryFilter) {
        matchesCategory = true;
      }
      // Fallback: check if product has category_id directly
      if (product.category_id === categoryFilter) {
        matchesCategory = true;
      }
      // Find category through subcategory lookup
      const productSubcategory = subcategories.find(sub => sub.id === product.subcategory_id);
      if (productSubcategory?.category_id === categoryFilter) {
        matchesCategory = true;
      }
      // Find category through group->subcategory lookup
      const productGroup = groups.find(g => g.id === product.group_id);
      const groupSubcategory = subcategories.find(sub => sub.id === productGroup?.subcategory_id);
      if (groupSubcategory?.category_id === categoryFilter) {
        matchesCategory = true;
      }
    }
    
    // Subcategory filtering
    let matchesSubcategory = !subcategoryFilter;
    if (subcategoryFilter && !matchesSubcategory) {
      // Direct subcategory match
      if (product.subcategory_id === subcategoryFilter) {
        matchesSubcategory = true;
      }
      // Through group relation
      if (product.groups?.subcategory_id === subcategoryFilter) {
        matchesSubcategory = true;
      }
      // Find subcategory through group lookup
      const productGroup = groups.find(g => g.id === product.group_id);
      if (productGroup?.subcategory_id === subcategoryFilter) {
        matchesSubcategory = true;
      }
    }
    
    // Group filtering
    const matchesGroup = !groupFilter || product.group_id === groupFilter;
    
    // Active status filtering
    const matchesActive = !activeFilter || String(product.active) === String(activeFilter);
    
    return matchesSearch && matchesCategory && matchesSubcategory && matchesGroup && matchesActive;
  });

  // For infinite scroll - show products up to displayedItems count
  const displayedProducts = filteredProducts.slice(0, displayedItems);
  const hasMoreItems = displayedItems < filteredProducts.length;

  // Load more items function
  const loadMoreItems = () => {
    if (!isLoadingMore && hasMoreItems) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setDisplayedItems(prev => Math.min(prev + itemsPerLoad, filteredProducts.length));
        setIsLoadingMore(false);
      }, 500);
    }
  };

  // Scroll event handler for infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        loadMoreItems();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [displayedItems, filteredProducts.length, isLoadingMore, hasMoreItems]);

  // Reset displayed items when filters change
  useEffect(() => {
    setDisplayedItems(itemsPerLoad);
  }, [searchQuery, categoryFilter, subcategoryFilter, groupFilter, activeFilter, itemsPerLoad]);

  // Auto-clear dependent filters when parent filters change
  useEffect(() => {
    // If category filter changes, clear subcategory and group filters
    if (categoryFilter) {
      const validSubcategories = subcategories.filter(sub => sub.category_id === categoryFilter);
      const currentSubcategoryValid = validSubcategories.some(sub => sub.id === subcategoryFilter);
      if (!currentSubcategoryValid) {
        setSubcategoryFilter(null);
        setGroupFilter(null);
      }
    }
  }, [categoryFilter, subcategories, subcategoryFilter]);

  useEffect(() => {
    // If subcategory filter changes, clear group filter if it's not valid
    if (subcategoryFilter) {
      const validGroups = groups.filter(group => group.subcategory_id === subcategoryFilter);
      const currentGroupValid = validGroups.some(group => group.id === groupFilter);
      if (!currentGroupValid) {
        setGroupFilter(null);
      }
    }
  }, [subcategoryFilter, groups, groupFilter]);

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }
    
    try {
      const result = await deleteProduct(id);
      
      if (result.success) {
        // Update local state
        setProducts(products.filter(product => product.id !== id));
      } else {
        alert(result.error || "Failed to delete product");
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  const openAddModal = () => {
    setCurrentProduct(null);
    setNewProduct({
      name: "",
      price: 0,
      subcategory_id: "",
      group_id: "",
      stock: 0,
      active: true,
      description: "",
      image: null,
      old_price: 0,
      discount: 0,
      in_stock: true,
      rating: 0,
      review_count: 0,
      featured: false,
      popular: false
    });
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setCurrentProduct(product);
    setNewProduct({ ...product });
    setModalOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category_id || !newProduct.subcategory_id || !newProduct.group_id) {
      alert("Please fill in all required fields including category, subcategory, and group");
      return;
    }
    
    try {
      if (currentProduct) {
        // Edit existing product
        const result = await updateProduct(
          currentProduct.id,
          newProduct,
          typeof newProduct.image === 'object' ? newProduct.image : null
        );
        
        if (result.success) {
          // Refresh product list
          fetchProducts();
          setModalOpen(false);
        } else {
          alert(result.error || "Failed to update product");
        }
      } else {
        // Add new product
        const result = await addProduct(
          newProduct,
          newProduct.image
        );
        
        if (result.success) {
          // Add to local state
          setProducts([...products, result.product]);
          setModalOpen(false);
        } else {
          alert(result.error || "Failed to add product");
        }
      }
    } catch (err) {
      console.error("Error saving product:", err);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  const handleImageClick = (product) => {
    if (product.image) {
      setPreviewImage(product.image);
      setImagePreviewOpen(true);
    }
  };





  return (
    <div className="p-6 mantine-bg min-h-screen">
      <Modal opened={imagePreviewOpen} onClose={() => setImagePreviewOpen(false)} title="Product Image Preview" centered size="lg">
        {previewImage && <img src={previewImage} alt="Product" style={{ width: '100%', maxHeight: 500, objectFit: 'contain', borderRadius: 8 }} />}
      </Modal>
      <Card shadow="sm" p="lg" radius="md" className="mantine-card mb-6">
        <Group position="apart" className="mb-4">
          <div>
            <Title order={2}>Products Management</Title>
            <Text size="sm" color="dimmed" className="mt-1">
              {loading ? 'Loading...' : `${filteredProducts.length} of ${products.length} products`}
              {(searchQuery || categoryFilter || subcategoryFilter || groupFilter || activeFilter) && ' (filtered)'}
            </Text>
          </div>
          <Button 
            icon={<FaPlus />} 
            color="blue"
            variant="filled"
            onClick={openAddModal}
          >
            Add New Product
          </Button>
        </Group>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-md border border-red-200 dark:border-red-700">
            {error}
          </div>
        )}  
        
        {loading && (
          <div className="flex justify-center items-center p-6">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 dark:border-blue-400"></div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 flex-1">
            <TextInput
              placeholder="Search products..."
              leftSection={<FaSearch />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            <Select
              placeholder="Filter by Category"
              clearable
              data={categories.map(cat => ({ value: cat.id, label: cat.name }))}
              value={categoryFilter}
              onChange={setCategoryFilter}
            />
            
            <Select
              placeholder="Filter by Subcategory"
              clearable
              data={subcategories
                .filter(sub => {
                  if (!categoryFilter) return true;
                  // Check if subcategory belongs to selected category
                  return sub.category_id === categoryFilter;
                })
                .map(sub => ({ value: sub.id, label: sub.name }))}
              value={subcategoryFilter}
              onChange={(value) => {
                setSubcategoryFilter(value);
                // Clear group filter if subcategory changes
                if (groupFilter) {
                  setGroupFilter(null);
                }
              }}
            />
            
            <Select
              placeholder="Filter by Group"
              clearable
              data={groups
                .filter(group => {
                  if (!subcategoryFilter) return true;
                  // Check if group belongs to selected subcategory
                  return group.subcategory_id === subcategoryFilter;
                })
                .map(group => ({ value: group.id, label: group.name }))}
              value={groupFilter}
              onChange={setGroupFilter}
            />
            
            <Select
              placeholder="Filter by Status"
              clearable
              data={[
                { value: "true", label: "Active" },
                { value: "false", label: "Inactive" }
              ]}
              value={activeFilter}
              onChange={setStatusFilter}
            />
          </div>
          
          {(searchQuery || categoryFilter || subcategoryFilter || groupFilter || activeFilter) && (
            <Button 
              variant="light" 
              color="gray"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter(null);
                setSubcategoryFilter(null);
                setGroupFilter(null);
                setStatusFilter(null);
                setActivePage(1);
              }}
              className="lg:w-auto w-full"
            >
              Clear Filters
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <Table striped highlightOnHover className="min-w-full">
            <colgroup>
              <col style={{ width: '120px' }} />  {/* Image */}
              <col style={{ width: '200px' }} />  {/* Name */}
              <col style={{ width: '250px' }} />  {/* Category Path */}
              <col style={{ width: '100px' }} />  {/* Price */}
              <col style={{ width: '100px' }} />  {/* Old Price */}
              <col style={{ width: '80px' }} />   {/* Discount */}
              <col style={{ width: '80px' }} />   {/* Stock */}
              <col style={{ width: '80px' }} />   {/* In Stock */}
              <col style={{ width: '100px' }} />  {/* Rating */}
              <col style={{ width: '80px' }} />   {/* Featured */}
              <col style={{ width: '80px' }} />   {/* Popular */}
              <col style={{ width: '90px' }} />   {/* Status */}
              <col style={{ width: '110px' }} />  {/* Created */}
              <col style={{ width: '100px' }} />  {/* Actions */}
            </colgroup>
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700">
                <th style={{ textAlign: 'center', padding: '12px 8px' }} className="text-gray-800 dark:text-gray-200 font-semibold">Image</th>
                <th style={{ padding: '12px 8px' }} className="text-gray-800 dark:text-gray-200 font-semibold">Name</th>
                <th style={{ padding: '12px 8px' }} className="text-gray-800 dark:text-gray-200 font-semibold">Category Path</th>
                <th style={{ textAlign: 'right', padding: '12px 8px' }} className="text-gray-800 dark:text-gray-200 font-semibold">Price</th>
                <th style={{ textAlign: 'right', padding: '12px 8px' }} className="text-gray-800 dark:text-gray-200 font-semibold">Old Price</th>
                <th style={{ textAlign: 'center', padding: '12px 8px' }} className="text-gray-800 dark:text-gray-200 font-semibold">Discount</th>
                <th style={{ textAlign: 'center', padding: '12px 8px' }} className="text-gray-800 dark:text-gray-200 font-semibold">Stock</th>
                <th style={{ textAlign: 'center', padding: '12px 8px' }} className="text-gray-800 dark:text-gray-200 font-semibold">In Stock</th>
                <th style={{ textAlign: 'center', padding: '12px 8px' }} className="text-gray-800 dark:text-gray-200 font-semibold">Rating</th>
                <th style={{ textAlign: 'center', padding: '12px 8px' }} className="text-gray-800 dark:text-gray-200 font-semibold">Featured</th>
                <th style={{ textAlign: 'center', padding: '12px 8px' }} className="text-gray-800 dark:text-gray-200 font-semibold">Popular</th>
                <th style={{ textAlign: 'center', padding: '12px 8px' }} className="text-gray-800 dark:text-gray-200 font-semibold">Status</th>
                <th style={{ textAlign: 'center', padding: '12px 8px' }} className="text-gray-800 dark:text-gray-200 font-semibold">Created</th>
                <th style={{ textAlign: 'center', padding: '12px 8px' }} className="text-gray-800 dark:text-gray-200 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-blue-50 dark:hover:bg-gray-800/50 transition-all duration-200 border-b border-gray-100 dark:border-gray-700">
                  <td style={{ textAlign: 'center', padding: '8px' }}>
                    <div style={{ 
                      width: '80px', 
                      height: '60px', 
                      overflow: 'hidden', 
                      borderRadius: '4px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      background: '#f8fafc', 
                      margin: '0 auto', 
                      cursor: product.image ? 'pointer' : 'default',
                      border: '1px solid #e2e8f0'
                    }}
                      className="dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-sm hover:shadow-md"
                      onClick={() => handleImageClick(product)}
                      title={product.image ? 'Click to view large' : ''}
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500">No Image</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">#{String(product.id).slice(-4)}</div>
                  </td>
                  <td style={{ padding: '8px' }}>
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-200" title={product.name} style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      maxHeight: '2.4em',
                      lineHeight: '1.2em'
                    }}>
                      {product.name}
                    </div>
                  </td>
                  <td style={{ padding: '8px' }}>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {(() => {
                        // Create a stable category path display
                        const renderCategoryPath = () => {
                          // If product has group with full hierarchy
                          if (product.groups?.subcategories?.categories) {
                            return (
                              <div className="space-y-1 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                                <div className="font-medium text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200">{product.groups.subcategories.categories.name}</div>
                                <div className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 pl-2">&gt; {product.groups.subcategories.name}</div>
                                <div className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 pl-4">&gt; {product.groups.name}</div>
                              </div>
                            );
                          }
                          
                          // If product has subcategory with category
                          if (product.subcategories?.categories) {
                            return (
                              <div className="space-y-1 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                                <div className="font-medium text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200">{product.subcategories.categories.name}</div>
                                <div className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 pl-2">&gt; {product.subcategories.name}</div>
                              </div>
                            );
                          }
                          
                          // Fallback - look up from state arrays if direct relations aren't loaded
                          if (product.category_id || product.subcategory_id || product.group_id) {
                            const category = categories.find(c => c.id === product.category_id);
                            const subcategory = subcategories.find(s => s.id === product.subcategory_id);
                            const group = groups.find(g => g.id === product.group_id);
                            
                            if (group && subcategory && category) {
                              return (
                                <div className="space-y-1 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                                  <div className="font-medium text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200">{category.name}</div>
                                  <div className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 pl-2">&gt; {subcategory.name}</div>
                                  <div className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 pl-4">&gt; {group.name}</div>
                                </div>
                              );
                            } else if (subcategory && category) {
                              return (
                                <div className="space-y-1 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                                  <div className="font-medium text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200">{category.name}</div>
                                  <div className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 pl-2">&gt; {subcategory.name}</div>
                                </div>
                              );
                            } else if (category) {
                              return (
                                <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                                  <div className="font-medium text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200">{category.name}</div>
                                </div>
                              );
                            }
                          }
                          
                          return <span className="text-gray-400 dark:text-gray-500">No category assigned</span>;
                        };
                        
                        return renderCategoryPath();
                      })()}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', padding: '8px' }}>
                    <div className="font-medium text-green-600 dark:text-green-400">
                      {formatIndianPrice(product.price)}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', padding: '8px' }}>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {product.old_price ? formatIndianPrice(product.old_price) : '-'}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>
                    {product.discount ? (
                      <Badge color="red" variant="light" size="sm">
                        {product.discount}%
                      </Badge>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">-</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>
                    <Badge color={product.stock > 10 ? 'green' : product.stock > 0 ? 'yellow' : 'red'} variant="light" size="sm">
                      {product.stock}
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>
                    <Badge color={product.in_stock ? 'green' : 'red'} variant="light" size="sm">
                      {product.in_stock ? 'Yes' : 'No'}
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>
                    <div className="text-sm dark:text-gray-200">
                      ⭐ {product.rating ?? 0}
                      <div className="text-xs text-gray-400 dark:text-gray-500">({product.review_count ?? 0})</div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>
                    <Badge color={product.featured ? 'yellow' : 'gray'} variant="light" size="sm">
                      {product.featured ? 'Yes' : 'No'}
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>
                    <Badge color={product.popular ? 'orange' : 'gray'} variant="light" size="sm">
                      {product.popular ? 'Yes' : 'No'}
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>
                    <Badge color={product.active ? 'green' : 'red'} size="sm">
                      {product.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      {product.created_at ? formatDateOnlyIST(product.created_at) : '-'}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>
                    <Group position="center" spacing={4}>
                      <ActionIcon 
                        color="blue" 
                        size="sm" 
                        onClick={() => openEditModal(product)} 
                        className="hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:scale-110 transition-all duration-200"
                        style={{ color: '#ffffff' }}
                      >
                        <FaEdit size={12} />
                      </ActionIcon>
                      <ActionIcon 
                        color="red" 
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="hover:bg-red-100 dark:hover:bg-red-900/30 hover:scale-110 transition-all duration-200"
                        style={{ color: '#ffffff' }}
                      >
                        <FaTrash size={12} />
                      </ActionIcon>
                    </Group>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* Infinite Scroll Status */}
        <div className="flex flex-col items-center mt-4 gap-4">
          <Text size="sm" color="dimmed" className="text-center">
            Showing {displayedProducts.length} of {filteredProducts.length} products
            {(searchQuery || categoryFilter || subcategoryFilter || groupFilter || activeFilter) && ' (filtered)'}
          </Text>
          
          {isLoadingMore && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 dark:border-blue-400"></div>
              <Text size="sm" className="text-blue-700 dark:text-blue-300">Loading more products...</Text>
            </div>
          )}
          
          {hasMoreItems && !isLoadingMore && (
            <Button 
              variant="light" 
              color="blue"
              onClick={loadMoreItems}
              className="w-full sm:w-auto"
            >
              Load More Products ({filteredProducts.length - displayedProducts.length} remaining)
            </Button>
          )}
          
          {!hasMoreItems && displayedProducts.length > itemsPerLoad && (
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
              <Text size="sm" className="text-green-700 dark:text-green-300">✅ All products loaded</Text>
            </div>
          )}
        </div>

        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-8">
            <Text size="lg" color="dimmed">No products found</Text>
            <Text size="sm" color="dimmed" className="mt-2">
              {searchQuery || categoryFilter || subcategoryFilter || groupFilter || activeFilter ? 
                'Try adjusting your filters or search terms' : 
                'Click "Add New Product" to get started'
              }
            </Text>
          </div>
        )}
      </Card>

      {/* Add/Edit Product Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={currentProduct ? "Edit Product" : "Add New Product"}
        size="lg"
      >
        <div className="flex flex-col gap-4">
          <TextInput
            label="Product Name"
            placeholder="Enter product name"
            required
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          />

          <div className="flex flex-col md:flex-row gap-4">
            <NumberInput
              className="flex-1"
              label="Price (₹)"
              placeholder="Enter price"
              required
              value={newProduct.price}
              onChange={(value) => {
                const updatedProduct = { ...newProduct, price: value };
                // Auto-calculate discount if old_price exists
                if (updatedProduct.old_price && updatedProduct.old_price > 0 && value > 0) {
                  const discountPercent = Math.round(((updatedProduct.old_price - value) / updatedProduct.old_price) * 100);
                  updatedProduct.discount = Math.max(0, discountPercent);
                }
                setNewProduct(updatedProduct);
              }}
              min={0}
            />
            <NumberInput
              className="flex-1"
              label="Old Price (₹)"
              placeholder="Enter old price (optional)"
              value={newProduct.old_price}
              onChange={(value) => {
                const updatedProduct = { ...newProduct, old_price: value };
                // Auto-calculate discount if current price exists
                if (updatedProduct.price && updatedProduct.price > 0 && value > 0) {
                  const discountPercent = Math.round(((value - updatedProduct.price) / value) * 100);
                  updatedProduct.discount = Math.max(0, discountPercent);
                }
                setNewProduct(updatedProduct);
              }}
              min={0}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <NumberInput
              className="flex-1"
              label="Discount (%)"
              placeholder="Auto-calculate or enter manually"
              value={newProduct.discount}
              onChange={(value) => {
                const updatedProduct = { ...newProduct, discount: value };
                // Auto-calculate old price if current price and discount exist
                if (updatedProduct.price && updatedProduct.price > 0 && value > 0) {
                  const oldPrice = Math.round(updatedProduct.price / (1 - value / 100));
                  updatedProduct.old_price = oldPrice;
                }
                setNewProduct(updatedProduct);
              }}
              min={0}
              max={100}
              rightSection="%"
            />
            <NumberInput
              className="flex-1"
              label="Stock"
              placeholder="Enter stock quantity"
              required
              value={newProduct.stock}
              onChange={(value) => setNewProduct({ ...newProduct, stock: value })}
              min={0}
            />
          </div>

          {/* Discount Calculation Helper */}
          {(newProduct.price > 0 || newProduct.old_price > 0 || newProduct.discount > 0) && (
            <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700 shadow-sm">
              <Text size="sm" weight={500} className="mb-4 text-blue-800 dark:text-blue-300">
                Pricing Helper
              </Text>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="bg-white dark:bg-gray-800/50 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                  <Text color="dimmed" className="text-gray-600 dark:text-gray-400 font-medium mb-1">Current Price:</Text>
                  <Text weight={600} className="text-gray-900 dark:text-gray-100 text-sm">₹{newProduct.price || 0}</Text>
                </div>
                <div className="bg-white dark:bg-gray-800/50 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                  <Text color="dimmed" className="text-gray-600 dark:text-gray-400 font-medium mb-1">Old Price:</Text>
                  <Text weight={600} className="text-gray-900 dark:text-gray-100 text-sm">₹{newProduct.old_price || 0}</Text>
                </div>
                <div className="bg-white dark:bg-gray-800/50 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                  <Text color="dimmed" className="text-gray-600 dark:text-gray-400 font-medium mb-1">You Save:</Text>
                  <Text weight={600} className="text-green-700 dark:text-green-400 text-sm">
                    {newProduct.old_price && newProduct.price ? 
                      `₹${newProduct.old_price - newProduct.price} (${newProduct.discount}%)` : 
                      '₹0 (0%)'
                    }
                  </Text>
                </div>
              </div>
            </div>
          )}

          {/* Category Selection */}
          <div className="space-y-3">
            <Text size="sm" weight={500}>Category Selection (Required)</Text>
            
            {(newProduct.category_id || newProduct.subcategory_id || newProduct.group_id) ? (
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-center justify-between mb-3">
                  <Text size="sm" weight={500} className="text-green-800 dark:text-green-300 flex items-center gap-2">
                    ✅ <span>Selected Categories</span>
                  </Text>
                  <Button
                    size="xs"
                    variant="subtle"
                    color="green"
                    onClick={() => {
                      setNewProduct({
                        ...newProduct,
                        category_id: "",
                        subcategory_id: "",
                        group_id: ""
                      });
                      setGroupSearchQuery("");
                      setSelectedCategory(null);
                      setSelectedSubcategory(null);
                      setSelectedGroup(null);
                      setHoveredCategory(null);
                      setHoveredSubcategory(null);
                      setCategorySearchQuery("");
                      setSubcategorySearchQuery("");
                      setGroupColumnSearchQuery("");
                    }}
                  >
                    Clear Selection
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {newProduct.category_id && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <Text className="font-medium text-blue-700 dark:text-blue-300">
                        {categories.find(c => c.id === newProduct.category_id)?.name || 'Unknown Category'}
                      </Text>
                    </div>
                  )}
                  {newProduct.subcategory_id && (
                    <div className="flex items-center gap-2 text-sm pl-4">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <Text className="text-indigo-600 dark:text-indigo-400">
                        {subcategories.find(s => s.id === newProduct.subcategory_id)?.name || 'Unknown Subcategory'}
                      </Text>
                    </div>
                  )}
                  {newProduct.group_id && (
                    <div className="flex items-center gap-2 text-sm pl-8">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <Text className="text-purple-600 dark:text-purple-400">
                        {groups.find(g => g.id === newProduct.group_id)?.name || 'Unknown Group'}
                      </Text>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Quick Search */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Text weight={600} className="text-gray-800 dark:text-gray-200">Quick Group Search</Text>
                    <Text size="sm" className="text-gray-600 dark:text-gray-400">
                      Search and select a group directly. Category and subcategory will be auto-selected.
                    </Text>
                  </div>
                  
                  <TextInput
                    placeholder="Search groups..."
                    value={groupSearchQuery}
                    onChange={(e) => setGroupSearchQuery(e.target.value)}
                    leftSection={<FaSearch />}
                    size="md"
                  />
                  
                  {groupSearchQuery && (
                    <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                      {groups
                        .filter(group => group.name.toLowerCase().includes(groupSearchQuery.toLowerCase()))
                        .map((group) => {
                          const relatedSubcategory = subcategories.find(sub => sub.id === group.subcategory_id);
                          const relatedCategory = categories.find(cat => cat.id === relatedSubcategory?.category_id);
                          
                          return (
                            <div
                              key={group.id}
                              onClick={() => {
                                setNewProduct({
                                  ...newProduct,
                                  category_id: relatedCategory?.id || "",
                                  subcategory_id: relatedSubcategory?.id || "",
                                  group_id: group.id
                                });
                                setGroupSearchQuery("");
                              }}
                              className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600 cursor-pointer transition-colors bg-white dark:bg-gray-700"
                            >
                              <div className="space-y-3">
                                <Text weight={600} className="text-gray-800 dark:text-gray-200">{group.name}</Text>
                                <div className="space-y-2 pl-3">
                                  <div className="flex items-center gap-3 text-sm">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                    <Text className="text-blue-600 dark:text-blue-400">
                                      {relatedCategory?.name || 'Unknown Category'}
                                    </Text>
                                  </div>
                                  <div className="flex items-center gap-3 text-sm pl-5">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></div>
                                    <Text className="text-indigo-600 dark:text-indigo-400">
                                      {relatedSubcategory?.name || 'Unknown Subcategory'}
                                    </Text>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      {groups.filter(group => group.name.toLowerCase().includes(groupSearchQuery.toLowerCase())).length === 0 && (
                        <div className="text-center py-6">
                          <Text size="sm" color="dimmed">No groups found matching "{groupSearchQuery}"</Text>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Hover Navigation */}
                <div className="border-t pt-6">
                  <div className="space-y-2 mb-4">
                    <Text weight={600} className="text-gray-800 dark:text-gray-200">Browse Categories</Text>
                    <Text size="sm" className="text-gray-600 dark:text-gray-400">
                      Navigate through the category hierarchy by hovering or clicking.
                    </Text>
                  </div>
                  <div className="flex h-72 border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800/50">
                    {/* Categories Column */}
                    <div className="w-1/3 border-r border-gray-200 dark:border-gray-600 p-4 bg-white dark:bg-gray-700">
                      <Text weight={600} className="text-gray-800 dark:text-gray-200 mb-3 text-sm">Categories</Text>
                      <TextInput
                        placeholder="Search categories..."
                        value={categorySearchQuery}
                        onChange={(e) => setCategorySearchQuery(e.target.value)}
                        className="mb-3"
                        size="xs"
                      />
                      <div className="space-y-2 max-h-44 overflow-y-auto">
                        {categories
                          .filter(cat => cat.name.toLowerCase().includes(categorySearchQuery.toLowerCase()))
                          .map((category) => (
                            <div
                              key={category.id}
                              onMouseEnter={() => {
                                setHoveredCategory(category);
                                setHoveredSubcategory(null);
                              }}
                              onClick={() => {
                                setSelectedCategory(category);
                                setSelectedSubcategory(null);
                                setSelectedGroup(null);
                              }}
                              className={`p-3 rounded-lg cursor-pointer transition-colors text-xs ${
                                selectedCategory?.id === category.id
                                  ? 'bg-blue-500 text-white shadow-sm'
                                  : hoveredCategory?.id === category.id
                                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {category.name}
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Subcategories Column */}
                    <div className="w-1/3 border-r border-gray-200 dark:border-gray-600 p-4 bg-white dark:bg-gray-700">
                      <Text weight={600} className="text-gray-800 dark:text-gray-200 mb-3 text-sm">Subcategories</Text>
                      <TextInput
                        placeholder="Search subcategories..."
                        value={subcategorySearchQuery}
                        onChange={(e) => setSubcategorySearchQuery(e.target.value)}
                        className="mb-3"
                        size="xs"
                      />
                      <div className="space-y-2 max-h-44 overflow-y-auto">
                        {(hoveredCategory || selectedCategory) && subcategories
                          .filter(sub => sub.category_id === (hoveredCategory || selectedCategory)?.id)
                          .filter(sub => sub.name.toLowerCase().includes(subcategorySearchQuery.toLowerCase()))
                          .map((subcategory) => (
                            <div
                              key={subcategory.id}
                              onMouseEnter={() => setHoveredSubcategory(subcategory)}
                              onClick={() => {
                                setSelectedSubcategory(subcategory);
                                setSelectedGroup(null);
                              }}
                              className={`p-3 rounded-lg cursor-pointer transition-colors text-xs ${
                                selectedSubcategory?.id === subcategory.id
                                  ? 'bg-indigo-500 text-white shadow-sm'
                                  : hoveredSubcategory?.id === subcategory.id
                                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {subcategory.name}
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Groups Column */}
                    <div className="w-1/3 p-4 bg-white dark:bg-gray-700">
                      <Text weight={600} className="text-gray-800 dark:text-gray-200 mb-3 text-sm">Groups</Text>
                      <TextInput
                        placeholder="Search groups..."
                        value={groupColumnSearchQuery}
                        onChange={(e) => setGroupColumnSearchQuery(e.target.value)}
                        className="mb-3"
                        size="xs"
                      />
                      <div className="space-y-2 max-h-44 overflow-y-auto">
                        {(hoveredSubcategory || selectedSubcategory) && groups
                          .filter(group => group.subcategory_id === (hoveredSubcategory || selectedSubcategory)?.id)
                          .filter(group => group.name.toLowerCase().includes(groupColumnSearchQuery.toLowerCase()))
                          .map((group) => (
                            <div
                              key={group.id}
                              onClick={() => {
                                setNewProduct({
                                  ...newProduct,
                                  category_id: (selectedCategory || hoveredCategory)?.id || "",
                                  subcategory_id: (selectedSubcategory || hoveredSubcategory)?.id || "",
                                  group_id: group.id
                                });
                                // Reset hover states
                                setSelectedCategory(null);
                                setSelectedSubcategory(null);
                                setSelectedGroup(null);
                                setHoveredCategory(null);
                                setHoveredSubcategory(null);
                                setCategorySearchQuery("");
                                setSubcategorySearchQuery("");
                                setGroupColumnSearchQuery("");
                              }}
                              className="p-3 rounded-lg cursor-pointer transition-colors text-xs hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-800 dark:hover:text-purple-200 text-gray-700 dark:text-gray-300 hover:shadow-sm"
                            >
                              {group.name}
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Switch
            label="Active"
            checked={newProduct.active}
            onChange={(e) => setNewProduct({ ...newProduct, active: e.currentTarget.checked })}
            color="green"
          />

          <Switch
            label="In Stock"
            checked={newProduct.in_stock}
            onChange={(e) => setNewProduct({ ...newProduct, in_stock: e.currentTarget.checked })}
            color="blue"
          />

          <Switch
            label="Featured"
            checked={newProduct.featured}
            onChange={(e) => setNewProduct({ ...newProduct, featured: e.currentTarget.checked })}
            color="yellow"
          />

          <Switch
            label="Popular"
            checked={newProduct.popular}
            onChange={(e) => setNewProduct({ ...newProduct, popular: e.currentTarget.checked })}
            color="orange"
          />

          <NumberInput
            label="Rating"
            placeholder="Enter rating (0-5)"
            value={newProduct.rating}
            onChange={(value) => setNewProduct({ ...newProduct, rating: value })}
            min={0}
            max={5}
            step={0.1}
            precision={1}
          />

          <NumberInput
            label="Review Count"
            placeholder="Enter review count"
            value={newProduct.review_count}
            onChange={(value) => setNewProduct({ ...newProduct, review_count: value })}
            min={0}
          />

          <Textarea
            label="Product Description"
            placeholder="Enter product description"
            minRows={3}
            value={newProduct.description || ""}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
          />

          <FileInput
            label="Product Image"
            placeholder="Upload image"
            accept="image/*"
            icon={<FaUpload size={14} />}
            value={newProduct.image}
            onChange={(file) => setNewProduct({ ...newProduct, image: file })}
          />

          <Group position="right" spacing="md" className="mt-4">
            <Button variant="default" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button color="blue" onClick={handleSaveProduct}>
              {currentProduct ? "Update Product" : "Add Product"}
            </Button>
          </Group>
        </div>
      </Modal>


      {/* Add custom styles for line-clamp if not available */}
      <style>
        {`
          .line-clamp-2 {
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
          .min-w-full {
            min-width: 100%;
          }
        `}
      </style>
    </div>
  );
};

export default ProductsPage;
