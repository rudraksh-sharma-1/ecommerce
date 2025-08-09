import supabase from "./supabase.ts";
//Video Banner
// Get all video banners


export async function getAllVideoBanners() {
  const { data, error } = await supabase.from("video_banner").select();
  if (error) return { success: false, error: error.message };

  // Do NOT call getPublicUrl again — just return the data directly
  return { success: true, videoBanners: data };
}



// PRINT REQUESTS
/**
 * Uploads an image to the 'prints' bucket and creates a new print request in the 'print_requests' table.
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.productType
 * @param {string} params.size
 * @param {string} params.color
 * @param {number} params.quantity
 * @param {string} params.position
 * @param {File} params.imageFile
 * @returns {Promise<{success: boolean, error?: string, request?: object}>}
 */
export async function createPrintRequest({
  userId,
  productType,
  size,
  color,
  quantity,
  position,
  imageFile,
}) {
  let imageUrl = null;
  if (imageFile && imageFile instanceof File) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("prints")
      .upload(fileName, imageFile);
    if (uploadError) {
      return { success: false, error: uploadError.message };
    }
    const { data: urlData } = supabase.storage
      .from("prints")
      .getPublicUrl(fileName);
    imageUrl = urlData.publicUrl;
  }
  const { data, error } = await supabase
    .from("print_requests")
    .insert([
      {
        user_id: userId,
        product_type: productType,
        size,
        color,
        quantity,
        position,
        image_url: imageUrl,
        status: "pending",
      },
    ])
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, request: data };
}

/**
 * Creates both a print request and an enquiry for custom printing orders.
 * This allows custom printing requests to appear in enquiry history with chat functionality.
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.productType
 * @param {string} params.size
 * @param {string} params.color
 * @param {number} params.quantity
 * @param {string} params.position
 * @param {File} params.imageFile
 * @param {string} params.name - User's name
 * @param {string} params.email - User's email
 * @param {string} params.phone - User's phone (optional)
 * @returns {Promise<{success: boolean, error?: string, request?: object, enquiry?: object}>}
 */
export async function createPrintRequestWithEnquiry({
  userId,
  productType,
  size,
  color,
  quantity,
  position,
  imageFile,
  name,
  email,
  phone,
  totalPrice,
}) {
  let imageUrl = null;

  // Upload image first
  if (imageFile && imageFile instanceof File) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("prints")
      .upload(fileName, imageFile);
    if (uploadError) {
      return { success: false, error: uploadError.message };
    }
    const { data: urlData } = supabase.storage
      .from("prints")
      .getPublicUrl(fileName);
    imageUrl = urlData.publicUrl;
  }

  try {
    // 1. Create the print request with price information
    const { data: printRequest, error: printError } = await supabase
      .from("print_requests")
      .insert([
        {
          user_id: userId,
          product_type: productType,
          size,
          color,
          quantity,
          position,
          image_url: imageUrl,
          status: "pending",
          estimated_price: totalPrice || 0, // Store the calculated price from frontend
        },
      ])
      .select()
      .single();

    if (printError) {
      return { success: false, error: printError.message };
    }

    // 2. Create corresponding enquiry for chat functionality
    const enquiryMessage = `Custom printing request for ${productType}\n\nDetails:\n- Size: ${size}\n- Color: ${color}\n- Quantity: ${quantity}\n- Position: ${position}\n- Estimated Price: ₹${totalPrice || 0
      }\n\nImage: ${imageUrl || "No image uploaded"}`;

    const enquiryData = {
      user_id: userId,
      name,
      email,
      phone: phone || null,
      message: enquiryMessage,
    };

    // Add type field for custom printing
    enquiryData.type = "custom_printing";

    const { data: enquiry, error: enquiryError } = await supabase
      .from("enquiries")
      .insert([enquiryData])
      .select()
      .single();

    if (enquiryError) {
      // If enquiry creation fails, we should clean up the print request
      await supabase.from("print_requests").delete().eq("id", printRequest.id);
      return { success: false, error: enquiryError.message };
    }

    // 3. Update print request with enquiry_id for linking
    await supabase
      .from("print_requests")
      .update({ enquiry_id: enquiry.id })
      .eq("id", printRequest.id);

    // 4. Create enquiry item for the custom print with calculated price
    const enquiryItem = {
      enquiry_id: enquiry.id,
      product_id: null, // No product ID for custom prints
      product_name: `Custom ${productType} - ${size}, ${color}`,
      price: totalPrice || 0, // Use the calculated price from frontend
      quantity: quantity,
      customization: `Position: ${position}, Image: ${imageUrl || "No image"}`,
    };

    const { error: itemError } = await supabase
      .from("enquiry_items")
      .insert([enquiryItem]);

    if (itemError) {
      // Clean up both records if item creation fails
      await supabase.from("print_requests").delete().eq("id", printRequest.id);
      await supabase.from("enquiries").delete().eq("id", enquiry.id);
      return { success: false, error: itemError.message };
    }

    return {
      success: true,
      request: printRequest,
      enquiry: enquiry,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get user's printing requests
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, requests?: Array, error?: string}>}
 */
export async function getUserPrintingRequests(userId) {
  try {
    const { data, error } = await supabase
      .from("print_requests")
      .select(
        `
        *,
        print_request_replies(*)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, requests: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Add reply to print request (for customer chat)
 * @param {string} requestId - Print request ID
 * @param {string} message - Reply message
 * @param {boolean} isAdmin - Whether reply is from admin
 * @returns {Promise<{success: boolean, reply?: object, error?: string}>}
 */
export async function addPrintRequestReply(
  requestId,
  message,
  isAdmin = false
) {
  try {
    const { data, error } = await supabase
      .from("print_request_replies")
      .insert([
        {
          print_request_id: requestId,
          message: message,
          is_admin: isAdmin,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return { success: true, reply: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get user profile information from the users table
 * @param {string} userId - The user ID
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, user: data };
}

// BANNERS
export async function getshipping() {
  const { data, error } = await supabase.from("shipping_banners").select();
  if (error) return { success: false, error: error.message };
  return { success: true, banners: data };
}

export async function getActiveShippingBanner() {
  const { data, error } = await supabase
    .from("shipping_banners")
    .select("*")
    .eq("active", true)
    .limit(1)
    .single();
    
  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is not an error here
    return { success: false, error: error.message };
  }
  
  return { success: true, banner: data };
}
export async function getAllBanners() {
  const { data, error } = await supabase.from("banners").select();
  if (error) return { success: false, error: error.message };
  return { success: true, banners: data };
}

export async function addBanner(banner, imageFile) {
  let imageUrl = banner.image;
  if (imageFile && imageFile instanceof File) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("banners")
      .upload(fileName, imageFile);
    if (uploadError) {
      return { success: false, error: uploadError.message };
    }
    const { data: urlData } = supabase.storage
      .from("banners")
      .getPublicUrl(fileName);
    imageUrl = urlData.publicUrl;
  }
  const bannerToInsert = { ...banner, image: imageUrl };
  const { data, error } = await supabase
    .from("banners")
    .insert([bannerToInsert])
    .select()
    .single();
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, banner: data };
}

export async function updateBanner(id, banner, imageFile) {
  let imageUrl = banner.image;
  if (imageFile && imageFile instanceof File) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("banners")
      .upload(fileName, imageFile);
    if (uploadError) return { success: false, error: uploadError.message };
    const { data: urlData } = supabase.storage
      .from("banners")
      .getPublicUrl(fileName);
    imageUrl = urlData.publicUrl;
  }
  const { data, error } = await supabase
    .from("banners")
    .update({ ...banner, image: imageUrl })
    .eq("id", id)
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, banner: data };
}

export async function deleteBanner(id) {
  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function toggleBannerStatus(id, active) {
  const { error } = await supabase
    .from("banners")
    .update({ active })
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// CATEGORIES
export async function getAllCategories() {
  const { data, error } = await supabase.from("categories").select();
  if (error) return { success: false, error: error.message };
  return { success: true, categories: data };
}

export async function getActiveCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select()
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (error) return { success: false, error: error.message };
  return { success: true, categories: data };
}

export async function addCategory(category) {
  const { data, error } = await supabase
    .from("categories")
    .insert([category])
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, category: data };
}

export async function updateCategory(id, category) {
  const { data, error } = await supabase
    .from("categories")
    .update(category)
    .eq("id", id)
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, category: data };
}

export async function deleteCategory(id) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// SUBCATEGORIES
export async function getAllSubcategories() {
  const { data, error } = await supabase
    .from("subcategories")
    .select("*, categories(id, name)")
    .order("sort_order", { ascending: true });
  if (error) return { success: false, error: error.message };
  return { success: true, subcategories: data };
}

export async function getSubcategoriesByCategory(categoryId) {
  const { data, error } = await supabase
    .from("subcategories")
    .select("*")
    .eq("category_id", categoryId)
    .order("sort_order", { ascending: true });
  if (error) return { success: false, error: error.message };
  return { success: true, subcategories: data };
}

export async function addSubcategory(subcategory) {
  const { data, error } = await supabase
    .from("subcategories")
    .insert([subcategory])
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, subcategory: data };
}

export async function updateSubcategory(id, subcategory) {
  const { data, error } = await supabase
    .from("subcategories")
    .update(subcategory)
    .eq("id", id)
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, subcategory: data };
}

export async function deleteSubcategory(id) {
  const { error } = await supabase.from("subcategories").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// GROUPS
export async function getAllGroups() {
  const { data, error } = await supabase
    .from("groups")
    .select("*, subcategories(id, name, categories(id, name))")
    .order("sort_order", { ascending: true });
  if (error) return { success: false, error: error.message };
  return { success: true, groups: data };
}

// PRODUCTS
/* getNearbyProducts(user_lat, user_lon) */
export async function getNearbyProducts(user_lat, user_lon) {
  const { data, error } = await supabase.rpc("get_products_within_15km", {
    user_lat,
    user_lon,
  });

  if (error) return { success: false, error: error.message };

  // Optionally: filter out products with inactive categories
  const filtered = (data || []).filter((product) => {
    return product.active !== false;
  });

  return { success: true, products: filtered };
}

// Fetch all products from Supabase
export async function getAllProducts() {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *, 
      groups(id, name, subcategories(id, name, categories(id, name, active))),
      subcategories(id, name, categories(id, name, active))
    `
    )
    .order("created_at", { ascending: false });
  if (error) return { success: false, error: error.message };
  // Filter out products whose category is not active
  const filtered = (data || []).filter((product) => {
    // If product has subcategories, check category active
    if (product.subcategories && product.subcategories.categories) {
      return product.subcategories.categories.active !== false;
    }
    // If product has groups, check subcategory's category active
    if (
      product.groups &&
      product.groups.subcategories &&
      product.groups.subcategories.categories
    ) {
      return product.groups.subcategories.categories.active !== false;
    }
    return true;
  });
  return { success: true, products: filtered };
}

// Fetch products by subcategory from Supabase
export async function getProductsBySubcategory(subcategoryId) {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *, 
      subcategories(id, name, categories(id, name, active))
    `
    )
    .eq("subcategory_id", subcategoryId)
    .order("created_at", { ascending: false });
  if (error) return { success: false, error: error.message };
  const filtered = (data || []).filter((product) => {
    if (product.subcategories && product.subcategories.categories) {
      return product.subcategories.categories.active !== false;
    }
    return true;
  });
  return { success: true, products: filtered };
}

// Fetch products by subcategory name from Supabase
export async function getProductsBySubcategoryName(subcategoryName, lat, lon) {
  const { data, error } = await supabase.rpc(
    "get_products_by_subcategory_within_15km",
    {
      subcategory_name: subcategoryName,
      user_lat: lat,
      user_lon: lon,
    }
  );

  if (error) {
    console.error("Error fetching products by subcategory:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, products: data || [] };
}

// Fetch products by category from Supabase (using subcategories)
export async function getProductsByCategory(categoryId) {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *, 
      subcategories(id, name, categories(id, name, active))
    `
    )
    .eq("subcategories.category_id", categoryId)
    .order("created_at", { ascending: false });
  if (error) return { success: false, error: error.message };
  const filtered = (data || []).filter((product) => {
    if (product.subcategories && product.subcategories.categories) {
      return product.subcategories.categories.active !== false;
    }
    return true;
  });
  return { success: true, products: filtered };
}

// Fetch products by category name from Supabase (using subcategories)
export async function getProductsByCategoryName(categoryName, lat, lon) {
  const { data, error } = await supabase.rpc(
    "get_products_by_category_within_15km",
    {
      category_name: categoryName,
      user_lat: lat,
      user_lon: lon,
    }
  );

  if (error) {
    console.error("Error fetching products by category:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, products: data || [] };
}

// Fetch products by group name from Supabase
export async function getProductsByGroupName(groupName, lat, lon) {
  const { data, error } = await supabase.rpc(
    "get_products_by_group_within_15km",
    {
      group_name: groupName,
      user_lat: lat,
      user_lon: lon,
    }
  );

  if (error) {
    console.error("Error fetching products by group:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, products: data || [] };
}

/* Add Products to Supabase */
export async function addProduct(product, imageFile) {
  let imageUrl = product.image;
  if (imageFile && imageFile instanceof File) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, imageFile);
    if (uploadError) return { success: false, error: uploadError.message };
    const { data: urlData } = supabase.storage
      .from("products")
      .getPublicUrl(fileName);
    imageUrl = urlData.publicUrl;
  }
  const { data, error } = await supabase
    .from("products")
    .insert([{ ...product, image: imageUrl }])
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, product: data };
}

/* Update Product in Supabase */
export async function updateProduct(id, product, imageFile) {
  let imageUrl = product.image;
  if (imageFile && imageFile instanceof File) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, imageFile);
    if (uploadError) return { success: false, error: uploadError.message };
    const { data: urlData } = supabase.storage
      .from("products")
      .getPublicUrl(fileName);
    imageUrl = urlData.publicUrl;
  }
  const { data, error } = await supabase
    .from("products")
    .update({ ...product, image: imageUrl })
    .eq("id", id)
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, product: data };
}

/* Delete Product In Supabase */
export async function deleteProduct(id) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// USERS
export async function getAllUsers() {
  const { data, error } = await supabase.from("users").select();
  if (error) return { success: false, error: error.message };
  return { success: true, users: data };
}

import { v4 as uuidv4 } from "uuid";

export async function addUser(userProfile) {
  const { data: dbUser, error: dbError } = await supabase
    .from("users")
    .insert([userProfile])
    .select()
    .single();
  if (dbError) {
    return { success: false, error: dbError.message };
  }
  return { success: true, user: dbUser };
}

export async function updateUser(id, user) {
  const { data, error } = await supabase
    .from("users")
    .update(user)
    .eq("id", id)
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, user: data };
}

export async function deleteUser(id) {
  const { error } = await supabase.from("users").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// --- CART MANAGEMENT ---

export async function addToCart(user_id, product_id, quantity = 1) {
  // Upsert: if item exists, update quantity; else insert
  const { data: existing, error: findError } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", user_id)
    .eq("product_id", product_id)
    .maybeSingle(); // Use maybeSingle to avoid 406 if not found
  if (findError && findError.code !== "PGRST116")
    return { success: false, error: findError.message };
  if (existing) {
    // Update quantity
    const { data, error } = await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) return { success: false, error: error.message };
    return { success: true, cartItem: data };
  } else {
    // Insert new
    const { data, error } = await supabase
      .from("cart_items")
      .insert([{ user_id, product_id, quantity }])
      .select()
      .single();
    if (error) return { success: false, error: error.message };
    return { success: true, cartItem: data };
  }
}

export const getCartItems = async (user_id) => {
  try {
    const res = await axios.get(`https://ecommerce-8342.onrender.com/api/cart/${user_id}`);
    return { success: true, cartItems: res.data.cartItems };
  } catch (err) {
    console.error("Error fetching cart items:", err);
    return { success: false, cartItems: [], error: err };
  }
};

export const updateCartItem = async (cart_item_id, quantity) => {
  try {
    const res = await axios.put(`https://ecommerce-8342.onrender.com/api/cart/update/${cart_item_id}`, { quantity });
    return { success: true, updated: res.data };
  } catch (err) {
    console.error("Error updating cart item:", err);
    return { success: false, error: err };
  }
};

export const removeCartItem = async (cart_item_id) => {
  try {
    const res = await axios.delete(`https://ecommerce-8342.onrender.com/api/cart/remove/${cart_item_id}`);
    return { success: true, removed: res.data };
  } catch (err) {
    console.error("Error removing cart item:", err);
    return { success: false, error: err };
  }
};

export const clearCart = async (user_id) => {
  try {
    const res = await axios.delete(`https://ecommerce-8342.onrender.com/api/cart/clear/${user_id}`);
    return { success: true, cleared: res.data };
  } catch (err) {
    console.error("Error clearing cart:", err);
    return { success: false, error: err };
  }
};

// --- WISHLIST MANAGEMENT ---
export async function getWishlistItems(user_id) {
  const { data, error } = await supabase
    .from("wishlist_items")
    .select("id, product_id, added_at, products(*)")
    .eq("user_id", user_id);
  if (error) return { success: false, error: error.message };
  // Flatten product data for easier use
  const wishlistItems = (data || []).map((item) => ({
    ...item.products,
    wishlist_item_id: item.id,
    added_at: item.added_at,
  }));
  return { success: true, wishlistItems };
}

export async function addToWishlist(user_id, product_id) {
  // Upsert: if item exists, do nothing; else insert
  const { data: existing, error: findError } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("user_id", user_id)
    .eq("product_id", product_id)
    .single();
  if (findError && findError.code !== "PGRST116")
    return { success: false, error: findError.message };
  if (existing) {
    // Already exists, do nothing
    return { success: true, wishlistItem: existing };
  } else {
    // Insert new
    const { data, error } = await supabase
      .from("wishlist_items")
      .insert([{ user_id, product_id }])
      .select()
      .single();
    if (error) return { success: false, error: error.message };
    return { success: true, wishlistItem: data };
  }
}

export async function removeFromWishlist(wishlist_item_id) {
  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("id", wishlist_item_id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/* export async function clearCart(user_id) {
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", user_id);
  if (error) return { success: false, error: error.message };
  return { success: true };
} */

// --- ORDER MANAGEMENT ---
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://ecommerce-8342.onrender.com/api/order';
// ORDERS
export async function getAllOrders() {
  try {
    const res = await axios.get(`${BASE_URL}/all`);
    return res.data;
  } catch (err) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

// 2. Update Order Status (Admin)
export async function updateOrderStatus(id, status, adminNotes = "") {
  try {
    const res = await axios.put(`${BASE_URL}/status/${id}`, {
      status,
      adminnotes: adminNotes,
    });
    return res.data;
  } catch (err) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

// 3. Place Order (Flat address)
export async function placeOrder(
  user_id,
  items,
  subtotal,
  shipping,
  total,
  address,
  payment_method
) {
  try {
    const res = await axios.post(`${BASE_URL}/place`, {
      user_id,
      items,
      subtotal,
      shipping,
      total,
      address,
      payment_method,
    });
    return res.data;
  } catch (err) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

// 4. Place Order with Detailed Address
export async function placeOrderWithDetailedAddress(
  user_id,
  items,
  subtotal,
  shipping,
  total,
  detailedAddress,
  payment_method,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature
) {
  try {
    const res = await axios.post(`${BASE_URL}/place-detailed`, {
      user_id,
      items,
      subtotal,
      shipping,
      total,
      detailedAddress,
      payment_method,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });
    return res.data;
  } catch (err) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

// 5. Get Orders for a User
export async function getUserOrders(user_id) {
  try {
    const res = await axios.get(`${BASE_URL}/user/${user_id}`);
    return res.data;
  } catch (err) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

export async function getOrderItemsByOrderId(order_id) {
  try {
    const res = await axios.get(`https://ecommerce-8342.onrender.com/api/orderItems/${order_id}`)
    return res.data
  }
  catch (error) {
    return { success: false, error: error.message };
  }
}


// --- ENQUIRY MANAGEMENT ---
export async function createEnquiry({
  user_id,
  name,
  email,
  phone,
  message,
  cartItems,
}) {
  // 1. Insert enquiry
  const { data: enquiry, error: enquiryError } = await supabase
    .from("enquiries")
    .insert([{ user_id, name, email, phone, message }])
    .select()
    .single();
  if (enquiryError) return { success: false, error: enquiryError.message };
  // 2. Insert enquiry items
  const itemsToInsert = cartItems.map((item) => ({
    enquiry_id: enquiry.id,
    product_id: item.id || item.product_id,
    product_name: item.name,
    price: item.price,
    quantity: item.quantity,
    customization: item.customization || null,
  }));
  const { error: itemsError } = await supabase
    .from("enquiry_items")
    .insert(itemsToInsert);
  if (itemsError) return { success: false, error: itemsError.message };
  return { success: true, enquiry };
}

export async function getAllEnquiries() {
  // Fetch all enquiries with user info and items
  const { data, error } = await supabase
    .from("enquiries")
    .select("*, users(*), enquiry_items(*, products(*))")
    .order("created_at", { ascending: false });
  if (error) return { success: false, error: error.message };
  return { success: true, enquiries: data };
}

// --- USER ENQUIRY HISTORY FUNCTIONS ---

export async function getUserEnquiries(userId) {
  // Fetch user's enquiries with items and replies count
  const { data, error } = await supabase
    .from("enquiries")
    .select(
      `
      *,
      enquiry_items(*, products(*)),
      enquiry_replies(id, is_admin, message, created_at)
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: error.message };

  // Calculate reply counts for each enquiry
  const enquiriesWithStats = data.map((enquiry) => ({
    ...enquiry,
    replyCount: enquiry.enquiry_replies ? enquiry.enquiry_replies.length : 0,
  }));

  return { success: true, enquiries: enquiriesWithStats };
}

export async function getEnquiryWithReplies(enquiryId) {
  // Fetch specific enquiry with all replies
  const { data, error } = await supabase
    .from("enquiries")
    .select(
      `
      *,
      enquiry_items(*, products(*)),
      enquiry_replies(*)
    `
    )
    .eq("id", enquiryId)
    .single();

  if (error) return { success: false, error: error.message };

  // Sort replies by created_at
  if (data.enquiry_replies) {
    data.enquiry_replies.sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );
  }

  return { success: true, enquiry: data };
}

export async function addEnquiryReply(
  enquiryId,
  message,
  isAdmin = false,
  adminId = null
) {
  // Add a new reply to an enquiry
  const { data, error } = await supabase
    .from("enquiry_replies")
    .insert([
      {
        enquiry_id: enquiryId,
        message: message,
        is_admin: isAdmin,
        admin_id: adminId,
      },
    ])
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  // Update enquiry status if user is replying
  if (!isAdmin) {
    await supabase
      .from("enquiries")
      .update({ status: "pending" })
      .eq("id", enquiryId);
  }

  return { success: true, reply: data };
}

export async function updateEnquiryStatus(enquiryId, status) {
  // Update enquiry status
  const { data, error } = await supabase
    .from("enquiries")
    .update({ status })
    .eq("id", enquiryId)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, enquiry: data };
}

export async function getUnreadEnquiryCount(userId) {
  // Get count of enquiries with unread admin replies (status = 'replied' and admin_reply = true)
  const { data, error } = await supabase
    .from("enquiries")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "replied")
    .eq("admin_reply", true);

  if (error) return { success: false, error: error.message };

  return { success: true, count: data.length };
}

export async function markEnquiriesAsRead(userId) {
  // Mark all 'replied' enquiries as 'resolved' to indicate user has seen the replies
  const { error } = await supabase
    .from("enquiries")
    .update({ status: "resolved" })
    .eq("user_id", userId)
    .eq("status", "replied");

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// WEBSITE SETTINGS
/**
 * Uploads an image for website settings (logo, banners, etc.)
 * @param {File} imageFile - Image file to upload
 * @param {string} folder - Folder name in storage
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export async function uploadWebsiteImage(imageFile, folder = "website") {
  if (!imageFile || !(imageFile instanceof File)) {
    return { success: false, error: "Invalid image file" };
  }

  const fileExt = imageFile.name.split(".").pop();
  const fileName = `${folder}/${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}.${fileExt}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("uploads")
    .upload(fileName, imageFile);

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  const { data: urlData } = supabase.storage
    .from("uploads")
    .getPublicUrl(fileName);

  return { success: true, url: urlData.publicUrl };
}

// PROMOTIONAL SETTINGS - Focused on marketing/promotional content
/**
 * Fetches all active promotional settings
 * @returns {Promise<{success: boolean, settings?: object, error?: string}>}
 */
export async function getPromotionalSettings() {
  const { data, error } = await supabase
    .from("promotional_settings")
    .select("*")
    .eq("is_active", true);

  if (error) return { success: false, error: error.message };

  // Convert array to key-value object for easier access
  const settings = {};
  data.forEach((setting) => {
    settings[setting.setting_key] = setting.setting_value;
  });

  return { success: true, settings };
}

/**
 * Updates a single promotional setting
 * @param {string} key - Setting key
 * @param {any} value - New value
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updatePromotionalSetting(key, value) {
  const { error } = await supabase.from("promotional_settings").upsert({
    setting_key: key,
    setting_value: value,
    updated_at: new Date().toISOString(),
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Updates multiple promotional settings at once
 * @param {Object} settings - Object with key-value pairs
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateMultiplePromotionalSettings(settings) {
  const updates = Object.entries(settings).map(([key, value]) => ({
    setting_key: key,
    setting_value: value,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from("promotional_settings").upsert(updates);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// USER PROFILE WITH DETAILED ADDRESS MANAGEMENT

/**
 * Update user profile with detailed address fields
 * @param {string} userId - The user ID
 * @param {Object} profileData - User profile data including detailed address fields
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export async function updateUserProfileWithAddress(userId, profileData) {
  const {
    houseNumber,
    streetAddress,
    suiteUnitFloor,
    locality,
    area,
    city,
    state,
    postalCode,
    country,
    landmark,
    ...otherFields
  } = profileData;

  const updateData = {
    ...otherFields,
    house_number: houseNumber || null,
    street_address: streetAddress || null,
    suite_unit_floor: suiteUnitFloor || null,
    locality: locality || null,
    area: area || null,
    city: city || null,
    state: state || null,
    postal_code: postalCode || null,
    country: country || "India",
    landmark: landmark || null,
  };

  const { data, error } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", userId)
    .select("*")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // Construct full address in JavaScript
  const addressParts = [
    data.house_number,
    data.street_address,
    data.suite_unit_floor,
    data.locality,
    data.area,
    data.city,
    data.state,
    data.postal_code,
    data.country,
    data.landmark,
  ].filter((part) => part && part.trim() !== "");

  const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : "";

  // Transform database fields to frontend-friendly names
  const transformedUser = {
    ...data,
    houseNumber: data.house_number,
    streetAddress: data.street_address,
    suiteUnitFloor: data.suite_unit_floor,
    postalCode: data.postal_code,
    fullAddress: fullAddress,
  };

  return { success: true, user: transformedUser };
}

export async function getUserProfileWithAddress(userId) {
  // Fetch all relevant fields directly (no computed column)
  const { data, error } = await supabase
    .from("users")
    .select(
      `
      *,
      house_number,
      street_address,
      suite_unit_floor,
      locality,
      area,
      city,
      state,
      postal_code,
      country,
      landmark
    `
    )
    .eq("id", userId)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // Construct formatted address in JS
  const addressParts = [
    data.house_number,
    data.street_address,
    data.suite_unit_floor,
    data.locality,
    data.area,
    data.city,
    data.state,
    data.postal_code,
    data.country,
    data.landmark,
  ].filter((part) => part && part.toString().trim() !== "");
  const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : "";

  // Transform database fields to frontend-friendly names for easier handling
  const transformedUser = {
    ...data,
    houseNumber: data.house_number,
    streetAddress: data.street_address,
    suiteUnitFloor: data.suite_unit_floor,
    locality: data.locality,
    area: data.area,
    city: data.city,
    state: data.state,
    postalCode: data.postal_code,
    country: data.country,
    landmark: data.landmark,
    fullAddress,
  };

  return { success: true, user: transformedUser };
}

export async function createUserProfileWithAddress(userProfile) {
  // Extract detailed address fields
  const {
    houseNumber,
    streetAddress,
    suiteUnitFloor,
    locality,
    area,
    city,
    state,
    postalCode,
    country,
    landmark,
    gstin,
    ...otherFields
  } = userProfile;

  // Prepare the insert object with detailed address fields
  const insertData = {
    ...otherFields,
    house_number: houseNumber || null,
    street_address: streetAddress || null,
    suite_unit_floor: suiteUnitFloor || null,
    locality: locality || null,
    area: area || null,
    city: city || null,
    state: state || null,
    postal_code: postalCode || null,
    country: country || "India",
    landmark: landmark || null,
    gstin: gstin || null,
    created_at: new Date().toISOString(),
  };

  const { data: dbUser, error: dbError } = await supabase
    .from("users")
    .insert([insertData])
    .select("*")
    .single();

  if (dbError) {
    return { success: false, error: dbError.message };
  }

  // Construct full address in JavaScript
  const addressParts = [
    dbUser.house_number,
    dbUser.street_address,
    dbUser.suite_unit_floor,
    dbUser.locality,
    dbUser.area,
    dbUser.city,
    dbUser.state,
    dbUser.postal_code,
    dbUser.country,
    dbUser.landmark,
  ].filter((part) => part && part.trim() !== "");

  const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : "";

  // Transform database fields to frontend-friendly names
  const transformedUser = {
    ...dbUser,
    houseNumber: dbUser.house_number,
    streetAddress: dbUser.street_address,
    suiteUnitFloor: dbUser.suite_unit_floor,
    locality: dbUser.locality,
    area: dbUser.area,
    city: dbUser.city,
    state: dbUser.state,
    postalCode: dbUser.postal_code,
    country: dbUser.country,
    landmark: dbUser.landmark,
    gstin: dbUser.gstin,
    fullAddress: fullAddress,
  };

  return { success: true, user: transformedUser };
}

/**
 * Search users by postal code (for delivery area checking, etc.)
 * @param {string} postalCode - The postal code to search for
 * @returns {Promise<{success: boolean, users?: array, error?: string}>}
 */

/**
 * Search users by city and state
 * @param {string} city - The city to search for
 * @param {string} state - The state to search for
 * @returns {Promise<{success: boolean, users?: array, error?: string}>}
 */
export async function getUsersByLocation(city, state) {
  let query = supabase
    .from("users")
    .select("id, name, email, city, state, postal_code");

  if (city) {
    query = query.ilike("city", `%${city}%`);
  }
  if (state) {
    query = query.ilike("state", `%${state}%`);
  }

  const { data, error } = await query;

  if (error) return { success: false, error: error.message };
  return { success: true, users: data };
}

// USER ADDRESSES
/* Get Default Address */
export async function getDefaultUserAddress(userId) {
  const { data, error } = await supabase
    .from("user_addresses")
    .select("*")
    .eq("user_id", userId)
    .eq("is_default", true)
    .single();

  if (error) {
    console.error("Failed to get default address:", error.message);
    return null;
  }

  return data;
}

/**
 * Get all addresses for a user
 * @param {string} userId - The user ID
 * @returns {Promise<{success: boolean, addresses?: Array, error?: string}>}
 */
export async function getUserAddresses(userId) {
  const { data, error } = await supabase
    .from("user_addresses")
    .select()
    .eq("user_id", userId)
    .order("is_default", { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, addresses: data };
}

/**
 * Get a user's default shipping address
 * @param {string} userId - The user ID
 * @returns {Promise<{success: boolean, address?: Object, error?: string}>}
 */
/* export async function getDefaultUserAddress(userId) {
  const { data, error } = await supabase
    .from("user_addresses")
    .select()
    .eq("user_id", userId)
    .eq("is_default", true)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No default address found, try to get any address
      const { data: anyAddress, error: anyError } = await supabase
        .from("user_addresses")
        .select()
        .eq("user_id", userId)
        .limit(1)
        .single();
      
      if (anyError) {
        return { success: false, error: "No address found" };
      }
      
      return { success: true, address: anyAddress };
    }
    return { success: false, error: error.message };
  }
  
  return { success: true, address: data };
} */

/**
 * Add a new address for a user
 * @param {string} userId - The user ID
 * @param {Object} address - The address data
 * @returns {Promise<{success: boolean, address?: Object, error?: string}>}
 */
import axios from "axios";

export async function addUserAddress(userId, address) {
  try {
    const response = await axios.post(
      "https://ecommerce-8342.onrender.com/api/geo-address/createAddress",
      {
        ...address,
        user_id: userId,
      }
    );

    return {
      success: true,
      address: response.data.data, // your backend returns it in .data.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || "Something went wrong",
    };
  }
}

/**
 * Update an existing address
 * @param {string} addressId - The address ID
 * @param {Object} address - The updated address data
 * @returns {Promise<{success: boolean, address?: Object, error?: string}>}
 */

export async function updateUserAddress(addressId, address) {
  try {
    const res = await axios.put(
      `https://ecommerce-8342.onrender.com/api/geo-address/update/${addressId}`,
      address
    );

    return {
      success: true,
      address: res.data.data,
    };
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.error || "Failed to update address",
    };
  }
}

/**
 * Delete a user address
 * @param {string} addressId - The address ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */

export async function deleteUserAddress(addressId) {
  try {
    await axios.delete(
      `https://ecommerce-8342.onrender.com/api/geo-address/delete/${addressId}`
    );

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.error || "Failed to delete address",
    };
  }
}

/**
 * Set an address as the default address
 * @param {string} userId - The user ID
 * @param {string} addressId - The address ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function setAddressAsDefault(userId, addressId) {
  const { error } = await supabase
    .from("user_addresses")
    .update({ is_default: true })
    .eq("id", addressId)
    .eq("user_id", userId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Migrate a user's address from the users table to the user_addresses table
 * @param {string} userId - The user ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function migrateUserAddresses(userId) {
  try {
    // Get user details from the users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError) {
      return { success: false, error: userError.message };
    }

    // Check if user has address information
    if (
      !userData.street_address ||
      !userData.city ||
      !userData.state ||
      !userData.country
    ) {
      return { success: false, error: "No address information to migrate" };
    }

    // Check if user already has addresses in user_addresses table
    const { data: existingAddresses, error: addressError } = await supabase
      .from("user_addresses")
      .select("id")
      .eq("user_id", userId);

    if (addressError) {
      return { success: false, error: addressError.message };
    }

    if (existingAddresses && existingAddresses.length > 0) {
      return { success: false, error: "User already has migrated addresses" };
    }

    // Create a new address entry from user profile data
    const addressData = {
      user_id: userId,
      address_name: "Primary Address",
      is_default: true,
      street_address: userData.street_address,
      suite_unit_floor: userData.suite_unit_floor,
      house_number: userData.house_number,
      locality: userData.locality,
      area: userData.area,
      city: userData.city,
      state: userData.state,
      postal_code: userData.postal_code,
      country: userData.country,
      landmark: userData.landmark,
    };

    const { error: insertError } = await supabase
      .from("user_addresses")
      .insert([addressData]);

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}


/* this is a testing commit */