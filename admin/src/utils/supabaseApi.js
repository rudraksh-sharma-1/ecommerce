import supabase, { supabaseAdmin } from "./supabase";
import { formatDateOnlyIST } from "./dateUtils";

//Video Banner
// Get all video banners
export async function getAllVideoBanners() {
  const { data, error } = await supabaseAdmin.from("video_banner").select();
  if (error) return { success: false, error: error.message };
  return { success: true, videoBanners: data };
}

// Add a new video banner (with status)
export async function addVideoBanner(videoBanner, videoFile) {
  let videoUrl = videoBanner.video_url;

  if (videoFile && videoFile instanceof File) {
    const fileExt = videoFile.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.${fileExt}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("videobanner")
      .upload(fileName, videoFile);

    if (uploadError) return { success: false, error: uploadError.message };

    const { data: urlData } = supabase.storage
      .from("videobanner")
      .getPublicUrl(fileName);

    videoUrl = urlData.publicUrl;
  }

  const insertData = {
    ...videoBanner,
    video_url: videoUrl,
    status: videoBanner.status ?? true, // default to true if not provided
  };

  const { data, error } = await supabase
    .from("video_banner")
    .insert([insertData])
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, videoBanner: data };
}

// Update a video banner (with status)
export async function updateVideoBanner(id, videoBanner, videoFile) {
  let videoUrl = videoBanner.video_url;

  if (videoFile && videoFile instanceof File) {
    const fileExt = videoFile.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.${fileExt}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("videobanner")
      .upload(fileName, videoFile);

    if (uploadError) return { success: false, error: uploadError.message };

    const { data: urlData } = supabase.storage
      .from("videobanner")
      .getPublicUrl(fileName);

    videoUrl = urlData.publicUrl;
  }

  const updateData = {
    ...videoBanner,
    video_url: videoUrl,
    status: videoBanner.status ?? true, // ensure status is included
  };

  const { data, error } = await supabase
    .from("video_banner")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, videoBanner: data };
}

// Delete a video banner
export async function deleteVideoBanner(id) {
  const { error } = await supabaseAdmin
    .from("video_banner")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// Toggle video banner status
export async function toggleVideoBannerStatus(id, status) {
  const { error } = await supabase
    .from("video_banner")
    .update({ status })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
//shipping BANNERS
// Get all shipping banners (no change needed)
export async function getshippingBanner() {
  const { data, error } = await supabase
    .from("shipping_banners")
    .select()
    .order("created_at", { ascending: false });
  if (error) return { success: false, error: error.message };
  return { success: true, banners: data };
}

// Helper to upload an image to the shipping_banners bucket
async function uploadShippingBannerImage(imageFile) {
  if (!imageFile || !(imageFile instanceof File)) {
    return { url: null, error: null };
  }
  const fileExt = imageFile.name.split(".").pop();
  const fileName = `shipping_${Date.now()}.${fileExt}`;
  const { error: uploadError } = await supabaseAdmin.storage
    .from("shippingbanners")
    .upload(fileName, imageFile);
  if (uploadError) {
    return { url: null, error: uploadError.message };
  }
  const { data: urlData } = supabaseAdmin.storage
    .from("shippingbanners")
    .getPublicUrl(fileName);
  return { url: urlData.publicUrl, error: null };
}

// Add a new shipping banner - only one image, no link field
export async function addShippingBanner(banner, imageFile) {
  // Deactivate all other banners if this one is active
  /* if (banner.active) {
    const { error: deactivateError } = await supabaseAdmin
      .from("shipping_banners")
      .update({ active: false })
      .neq('id', id);
    if (deactivateError)
      return { success: false, error: deactivateError.message };
  } */
  const { url, error } = await uploadShippingBannerImage(imageFile);
  if (error) return { success: false, error };

  const bannerToInsert = { ...banner, image_url: url };
  const { data, error: insertError } = await supabaseAdmin
    .from("shipping_banners")
    .insert([bannerToInsert])
    .select();
  if (insertError)
    return { success: false, error: insertError.message };
  return { success: true, banner: data };
}

// Update a shipping banner - multiple banners can be active
export async function updateShippingBanner(id, banner, imageFile) {
  let imageUrl = banner.image_url;
  if (imageFile) {
    const { url, error } = await uploadShippingBannerImage(imageFile);
    if (error) return { success: false, error };
    imageUrl = url;
  }

  const { data, error } = await supabaseAdmin
    .from("shipping_banners")
    .update({ ...banner, image_url: imageUrl, updated_at: new Date() })
    .eq("id", id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, banner: data };
}
// Delete a shipping banner (no change)
export async function deleteShippingBanner(id) {
  const { error } = await supabaseAdmin
    .from("shipping_banners")
    .delete()
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// Toggle banner status - allow multiple active
export async function toggleShippingBannerStatus(id, active) {
  try {
    const { error } = await supabaseAdmin
      .from("shipping_banners")
      .update({ active })
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
// BANNERS
export async function getAllBanners() {
  const { data, error } = await supabaseAdmin.from("banners").select();
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
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
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
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
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
  const { error } = await supabaseAdmin.from("banners").delete().eq("id", id);
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

export async function toggleMobileBannerStatus(id, is_mobile) {
  const { error } = await supabase
    .from("banners")
    .update({ is_mobile })
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ADS BANNERS
export async function getAllAdsBanners() {
  const { data, error } = await supabaseAdmin.from("ads_banners").select();
  if (error) return { success: false, error: error.message };
  return { success: true, adsBanners: data };
}

export async function addAdsBanner(banner, imageFile) {
  let imageUrl = banner.image_url || "";
  if (imageFile && imageFile instanceof File) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("banners")
      .upload(fileName, imageFile);
    if (uploadError) return { success: false, error: uploadError.message };
    const { data: urlData } = supabase.storage
      .from("banners")
      .getPublicUrl(fileName);
    imageUrl = urlData.publicUrl;
  }
  const adToInsert = {
    title: banner.title,
    subtitle: banner.subtitle,
    link: banner.link,
    image_url: imageUrl,
    active: banner.active,
  };
  const { data, error } = await supabase
    .from("ads_banners")
    .insert([adToInsert])
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, adsBanner: data };
}

export async function updateAdsBanner(id, banner, imageFile) {
  let imageUrl = banner.image_url || "";
  if (imageFile && imageFile instanceof File) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("banners")
      .upload(fileName, imageFile);
    if (uploadError) return { success: false, error: uploadError.message };
    const { data: urlData } = supabase.storage
      .from("banners")
      .getPublicUrl(fileName);
    imageUrl = urlData.publicUrl;
  }
  const adToUpdate = {
    title: banner.title,
    subtitle: banner.subtitle,
    link: banner.link,
    image_url: imageUrl,
    active: banner.active,
  };
  const { data, error } = await supabase
    .from("ads_banners")
    .update(adToUpdate)
    .eq("id", id)
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, adsBanner: data };
}

export async function deleteAdsBanner(id) {
  const { error } = await supabaseAdmin
    .from("ads_banners")
    .delete()
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function toggleAdsBannerStatus(id, active) {
  const { error } = await supabase
    .from("ads_banners")
    .update({ active })
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// CATEGORIES
export async function getAllCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("id", { ascending: false });
  if (error) return { success: false, error: error.message };
  return { success: true, categories: data };
}

export async function addCategory(category, imageFile) {
  let imageUrl = null;
  if (imageFile && imageFile instanceof File) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("categories")
      .upload(fileName, imageFile);
    if (uploadError) {
      return { success: false, error: uploadError.message };
    }
    const { data: urlData } = supabase.storage
      .from("categories")
      .getPublicUrl(fileName);
    imageUrl = urlData.publicUrl;
  }
  const categoryToInsert = { ...category, image_url: imageUrl };
  const { data, error } = await supabase
    .from("categories")
    .insert([categoryToInsert])
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, category: data };
}

export async function updateCategory(id, category, imageFile) {
  let imageUrl = category.image_url;
  if (imageFile && imageFile instanceof File) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("categories")
      .upload(fileName, imageFile);
    if (uploadError) {
      return { success: false, error: uploadError.message };
    }
    const { data: urlData } = supabase.storage
      .from("categories")
      .getPublicUrl(fileName);
    imageUrl = urlData.publicUrl;
  }
  const categoryToUpdate = { ...category, image_url: imageUrl };
  const { data, error } = await supabase
    .from("categories")
    .update(categoryToUpdate)
    .eq("id", id)
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, category: data };
}

// Get products by category
export async function getProductsByCategory(categoryId) {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, active")
    .eq("category_id", categoryId);
  if (error) return { success: false, error: error.message };
  return { success: true, products: data };
}

// Get product count by category
export async function getProductCountByCategory(categoryId) {
  const { count, error } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("category_id", categoryId);
  if (error) return { success: false, error: error.message };
  return { success: true, count: count || 0 };
}

// Check if category has products
export async function checkCategoryHasProducts(categoryId) {
  const { data, error } = await supabase
    .from("products")
    .select("id")
    .eq("category_id", categoryId)
    .limit(1);
  if (error) return { success: false, error: error.message };
  return { success: true, hasProducts: data && data.length > 0 };
}

// Delete category with proper handling
export async function deleteCategory(
  id,
  options = { forceDelete: false, reassignProductsTo: null }
) {
  try {
    // First check if category has products
    const productCheck = await checkCategoryHasProducts(id);
    if (!productCheck.success) {
      return { success: false, error: productCheck.error };
    }

    if (productCheck.hasProducts) {
      if (!options.forceDelete && !options.reassignProductsTo) {
        // Get products to show in the error message
        const productsResult = await getProductsByCategory(id);
        const productCount = productsResult.success
          ? productsResult.products.length
          : 0;
        return {
          success: false,
          error: `Cannot delete category because it contains ${productCount} product(s). Please either reassign the products to another category or choose to delete them.`,
          hasProducts: true,
          productCount,
        };
      }

      if (options.reassignProductsTo) {
        // Reassign products to another category
        const { error: reassignError } = await supabase
          .from("products")
          .update({ category_id: options.reassignProductsTo })
          .eq("category_id", id);

        if (reassignError) {
          return {
            success: false,
            error: `Failed to reassign products: ${reassignError.message}`,
          };
        }
      } else if (options.forceDelete) {
        // Delete all products in this category first
        const { error: deleteProductsError } = await supabase
          .from("products")
          .delete()
          .eq("category_id", id);

        if (deleteProductsError) {
          return {
            success: false,
            error: `Failed to delete products: ${deleteProductsError.message}`,
          };
        }
      }
    }

    // Also handle subcategories - check if any subcategories exist
    const { data: subcategories, error: subError } = await supabase
      .from("subcategories")
      .select("id")
      .eq("category_id", id);

    if (subError) {
      return { success: false, error: subError.message };
    }

    if (subcategories && subcategories.length > 0) {
      // Delete subcategories first (this will cascade to groups if properly set up)
      const { error: deleteSubError } = await supabase
        .from("subcategories")
        .delete()
        .eq("category_id", id);

      if (deleteSubError) {
        return {
          success: false,
          error: `Failed to delete subcategories: ${deleteSubError.message}`,
        };
      }
    }

    // Finally delete the category
    const { error } = await supabaseAdmin
      .from("categories")
      .delete()
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function toggleCategoryStatus(id, active) {
  const { data, error } = await supabase
    .from("categories")
    .update({ active })
    .eq("id", id)
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, category: data };
}

// SUBCATEGORIES
export async function getAllSubcategories() {
  const { data, error } = await supabase
    .from("subcategories")
    .select("*")
    .order("id", { ascending: false });
  if (error) return { success: false, error: error.message };
  return { success: true, subcategories: data };
}

export async function getSubcategoriesByCategory(categoryId) {
  const { data, error } = await supabase
    .from("subcategories")
    .select("*")
    .eq("category_id", categoryId)
    .order("name");
  if (error) return { success: false, error: error.message };
  return { success: true, subcategories: data };
}

export async function addSubcategory(subcategory, imageFile) {
  let imageUrl = null;
  if (imageFile && imageFile instanceof File) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("subcategories")
      .upload(fileName, imageFile);
    if (uploadError) {
      return { success: false, error: uploadError.message };
    }
    const { data: urlData } = supabase.storage
      .from("subcategories")
      .getPublicUrl(fileName);
    imageUrl = urlData.publicUrl;
  }
  const subcategoryToInsert = { ...subcategory, image_url: imageUrl };
  const { data, error } = await supabase
    .from("subcategories")
    .insert([subcategoryToInsert])
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, subcategory: data };
}

export async function updateSubcategory(id, subcategory, imageFile) {
  let imageUrl = subcategory.image_url;
  if (imageFile && imageFile instanceof File) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("subcategories")
      .upload(fileName, imageFile);
    if (uploadError) {
      return { success: false, error: uploadError.message };
    }
    const { data: urlData } = supabase.storage
      .from("subcategories")
      .getPublicUrl(fileName);
    imageUrl = urlData.publicUrl;
  }
  const subcategoryToUpdate = { ...subcategory, image_url: imageUrl };
  const { data, error } = await supabase
    .from("subcategories")
    .update(subcategoryToUpdate)
    .eq("id", id)
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, subcategory: data };
}

export async function deleteSubcategory(id) {
  const { error } = await supabaseAdmin
    .from("subcategories")
    .delete()
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// GROUPS
export async function getAllGroups() {
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .order("id", { ascending: false });
  if (error) return { success: false, error: error.message };
  return { success: true, groups: data };
}

export async function getGroupsBySubcategory(subcategoryId) {
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .eq("subcategory_id", subcategoryId)
    .order("name");
  if (error) return { success: false, error: error.message };
  return { success: true, groups: data };
}

export async function addGroup(group, imageFile) {
  let imageUrl = null;
  if (imageFile && imageFile instanceof File) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("groups")
      .upload(fileName, imageFile);
    if (uploadError) {
      return { success: false, error: uploadError.message };
    }
    const { data: urlData } = supabase.storage
      .from("groups")
      .getPublicUrl(fileName);
    imageUrl = urlData.publicUrl;
  }
  const groupToInsert = { ...group, image_url: imageUrl };
  const { data, error } = await supabase
    .from("groups")
    .insert([groupToInsert])
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, group: data };
}

export async function updateGroup(id, group, imageFile) {
  let imageUrl = group.image_url;
  if (imageFile && imageFile instanceof File) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("groups")
      .upload(fileName, imageFile);
    if (uploadError) {
      return { success: false, error: uploadError.message };
    }
    const { data: urlData } = supabase.storage
      .from("groups")
      .getPublicUrl(fileName);
    imageUrl = urlData.publicUrl;
  }
  const groupToUpdate = { ...group, image_url: imageUrl };
  const { data, error } = await supabase
    .from("groups")
    .update(groupToUpdate)
    .eq("id", id)
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, group: data };
}

export async function deleteGroup(id) {
  const { error } = await supabaseAdmin.from("groups").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// PRODUCTS
export async function getAllProducts() {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *, 
      groups(id, name, subcategories(id, name, categories(id, name))),
      subcategories(id, name, categories(id, name))
    `
    )
    .order("id", { ascending: false });
  if (error) return { success: false, error: error.message };
  return { success: true, products: data };
}

export async function addProduct(
  product,
  imageFiles = [],
  videoFile = null,
  displayImageFile = null
) {
  const imageUrls = [];
  let videoUrl = null;
  let displayImageUrl = product.image || null;

  // Upload display image (main image)
  if (displayImageFile && displayImageFile instanceof File) {
    const ext = displayImageFile.name.split(".").pop();
    const fileName = `display/${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.${ext}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("products")
      .upload(fileName, displayImageFile);
    if (uploadError) return { success: false, error: uploadError.message };

    const { data: urlData } = supabase.storage
      .from("products")
      .getPublicUrl(fileName);
    displayImageUrl = urlData.publicUrl;
  }

  // Upload all images
  for (const file of imageFiles) {
    const ext = file.name.split(".").pop();
    const fileName = `images/${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.${ext}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("products")
      .upload(fileName, file);
    if (uploadError) return { success: false, error: uploadError.message };

    const { data: urlData } = supabase.storage
      .from("products")
      .getPublicUrl(fileName);
    imageUrls.push(urlData.publicUrl);
  }

  // Upload video (if present)
  if (videoFile) {
    const ext = videoFile.name.split(".").pop();
    const videoName = `videos/${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.${ext}`;
    const { error: videoError } = await supabaseAdmin.storage
      .from("products")
      .upload(videoName, videoFile);
    if (videoError) return { success: false, error: videoError.message };

    const { data: videoUrlData } = supabase.storage
      .from("products")
      .getPublicUrl(videoName);
    videoUrl = videoUrlData.publicUrl;
  }

  // Only send valid DB fields
  const { data, error } = await supabase
    .from("products")
    .insert([
      {
        ...product,
        image: displayImageUrl,
        images: imageUrls,
        video: videoUrl,
      },
    ])
    .select();

  if (error) return { success: false, error: error.message };
  return { success: true, product: data[0] };
}

export async function updateProduct(
  id,
  product,
  displayImageFile = null,
  imageFiles = [],
  videoFile = null
) {
  let imageUrl = product.image;
  let imageUrls = product.images || [];
  let videoUrl = product.video || null;

  // Upload display image (main image) if provided
  if (displayImageFile && displayImageFile instanceof File) {
    const ext = displayImageFile.name.split(".").pop();
    const fileName = `display/${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.${ext}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("products")
      .upload(fileName, displayImageFile);
    if (uploadError) return { success: false, error: uploadError.message };
    const { data: urlData } = supabase.storage
      .from("products")
      .getPublicUrl(fileName);
    imageUrl = urlData.publicUrl;
  }

  // Upload new images if provided
  if (imageFiles && Array.isArray(imageFiles) && imageFiles.length > 0) {
    imageUrls = [];
    for (const file of imageFiles) {
      const ext = file.name.split(".").pop();
      const fileName = `images/${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}.${ext}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from("products")
        .upload(fileName, file);
      if (uploadError) return { success: false, error: uploadError.message };
      const { data: urlData } = supabase.storage
        .from("products")
        .getPublicUrl(fileName);
      imageUrls.push(urlData.publicUrl);
    }
  }

  // Upload new video if provided
  if (videoFile && videoFile instanceof File) {
    const ext = videoFile.name.split(".").pop();
    const videoName = `videos/${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.${ext}`;
    const { error: videoError } = await supabaseAdmin.storage
      .from("products")
      .upload(videoName, videoFile);
    if (videoError) return { success: false, error: videoError.message };
    const { data: videoUrlData } = supabase.storage
      .from("products")
      .getPublicUrl(videoName);
    videoUrl = videoUrlData.publicUrl;
  }

  const dbProduct = { ...product };

  // Remove any invalid fields
  delete dbProduct.groups;
  delete dbProduct.subcategories;
  delete dbProduct.categories;

  // Continue with the update
  const { data, error } = await supabase
    .from("products")
    .update({
      ...dbProduct,
      image: imageUrl,
      images: imageUrls,
      video: videoUrl,
    })
    .eq("id", id)
    .select();

  if (error) return { success: false, error: error.message };
  return { success: true, product: data[0] };
}

export async function deleteProduct(id) {
  const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// USERS
export async function getAllUsers() {
  const { data, error } = await supabaseAdmin.from("users").select();
  if (error) return { success: false, error: error.message };
  const users = data.map((u) => ({
    ...u,
    active: u.is_active,
    joined: u.created_at ? formatDateOnlyIST(u.created_at) : null,
  }));
  return { success: true, users };
}

// USER ADDRESSES
export async function getUserAddresses(userId) {
  try {
    // Import the admin client that bypasses RLS
    const { supabaseAdmin } = await import("./supabase.js");

    // First try with admin client
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from("user_addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false });

    if (!adminError && adminData) {
      return { success: true, addresses: adminData || [] };
    }

    // Fallback to regular client
    const { data, error } = await supabase
      .from("user_addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, addresses: data || [] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

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

export async function addUserAddress(userId, address) {
  try {
    const addressData = {
      ...address,
      user_id: userId,
    };

    // Import the admin client that bypasses RLS
    const { supabaseAdmin } = await import("./supabase.js");

    // Try with admin client first
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from("user_addresses")
      .insert([addressData])
      .select()
      .single();

    if (!adminError && adminData) {
      return { success: true, address: adminData };
    }

    // Fallback to regular client
    const { data, error } = await supabase
      .from("user_addresses")
      .insert([addressData])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, address: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateUserAddress(addressId, address) {
  try {
    // Import the admin client that bypasses RLS
    const { supabaseAdmin } = await import("./supabase.js");

    // Try with admin client first
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from("user_addresses")
      .update(address)
      .eq("id", addressId)
      .select()
      .single();

    if (!adminError && adminData) {
      return { success: true, address: adminData };
    }

    // Fallback to regular client
    const { data, error } = await supabase
      .from("user_addresses")
      .update(address)
      .eq("id", addressId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, address: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteUserAddress(addressId) {
  try {
    // Import the admin client that bypasses RLS
    const { supabaseAdmin } = await import("./supabase.js");

    // Try with admin client first
    const { error: adminError } = await supabaseAdmin
      .from("user_addresses")
      .delete()
      .eq("id", addressId);

    if (!adminError) {
      return { success: true };
    }

    // Fallback to regular client
    const { error } = await supabase
      .from("user_addresses")
      .delete()
      .eq("id", addressId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function setAddressAsDefault(userId, addressId) {
  try {
    // Import the admin client that bypasses RLS
    const { supabaseAdmin } = await import("./supabase.js");

    // Try with admin client first
    const { error: adminError } = await supabaseAdmin
      .from("user_addresses")
      .update({ is_default: true })
      .eq("id", addressId)
      .eq("user_id", userId);

    if (!adminError) {
      return { success: true };
    }

    // Fallback to regular client
    const { error } = await supabase
      .from("user_addresses")
      .update({ is_default: true })
      .eq("id", addressId)
      .eq("user_id", userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function addUser(user, password) {
  // 1. Create Supabase Auth user
  const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
    email: user.email,
    password: password,
    options: {
      data: {
        name: user.name,
        role: user.role || "customer",
      },
    },
  });
  if (authError) {
    return { success: false, error: authError.message };
  }
  // 2. Insert into users table
  const userProfile = {
    ...user,
    id: authData.user.id, // link by auth user id
    email: authData.user.email,
  };
  const { data, error } = await supabase
    .from("users")
    .insert([userProfile])
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, user: data };
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
  // 1. Delete from users table
  const { error: dbError } = await supabaseAdmin
    .from("users")
    .delete()
    .eq("id", id);
  if (dbError) return { success: false, error: dbError.message };

  // 2. Delete from Supabase Auth (admin)
  // This requires the service role key to be set in your supabase client
  let authError = null;
  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (error) authError = error;
  } catch (e) {
    authError = e;
  }
  if (authError) {
    return {
      success: false,
      error: `User deleted from DB but failed to delete from Auth: ${authError.message || authError
        }`,
    };
  }
  return { success: true };
}

export async function toggleUserStatus(id, isActive) {
  // 1. Update status in users table
  const { data, error } = await supabase
    .from("users")
    .update({ is_active: isActive })
    .eq("id", id)
    .select()
    .single();
  if (error) return { success: false, error: error.message };

  // 2. Ban or unban in Supabase Auth (admin)
  let authError = null;
  try {
    if (!isActive) {
      // Ban user (prevent login) for 100 years
      const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(
        id,
        { ban_duration: "876000h" }
      );
      if (banError) authError = banError;
    } else {
      // Unban user - use the dedicated unban method or update with ban_duration: "none"
      try {
        // Try the unban method first
        const { error: unbanError } =
          await supabaseAdmin.auth.admin.updateUserById(id, {
            ban_duration: "none",
          });
        if (unbanError) {
          // If that fails, try setting ban_duration to "0s"
          const { error: unbanError2 } =
            await supabaseAdmin.auth.admin.updateUserById(id, {
              ban_duration: "0s",
            });
          if (unbanError2) authError = unbanError2;
        }
      } catch (e) {
        authError = e;
      }
    }
  } catch (e) {
    authError = e;
  }
  if (authError) {
    return {
      success: false,
      error: `User status updated in DB but failed to update in Auth: ${authError.message || authError
        }`,
    };
  }
  return { success: true };
}

// ORDERS
export async function getAllOrders() {
  const { data, error } = await supabaseAdmin.from("orders").select();
  if (error) return { success: false, error: error.message };
  return { success: true, orders: data };
}

export async function updateOrderStatus(id, status, adminNotes = "") {
  const { error } = await supabase
    .from("orders")
    .update({ status, adminNotes })
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// DASHBOARD
export async function getDashboardData(timeframe) {
  const { data, error } = await supabaseAdmin.rpc("get_dashboard_data", {
    timeframe,
  });
  if (error) return { success: false, error: error.message };
  const d = data.dashboard || data;
  return {
    success: true,
    stats: d.stats || {},
    latestUsers: d.latestUsers || [],
    latestCustomPrints: d.latestCustomPrints || [],
    categorySales: d.categorySales || [],
    revenueData: d.revenueData || [],
    userActivity: d.userActivity || [],
    customPrintTypes: d.customPrintTypes || [],
    customPrintStatus: d.customPrintStatus || [],
    topProducts: d.topProducts || [],
    enquiryData: d.enquiryData || [],
    enquiryStatus: d.enquiryStatus || [],
  };
}

// ENQUIRY MANAGEMENT
export async function getAllEnquiries() {
  try {
    const { data, error } = await supabase
      .from("enquiries")
      .select(
        `
        *,
        users:user_id (id, name, email, phone),
        enquiry_items(enquiry_id, product_id, product_name, price, quantity, customization)
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, enquiries: data };
  } catch (error) {
    console.error("Error fetching enquiries:", error);
    return { success: false, error: error.message };
  }
}

export async function getEnquiryWithReplies(enquiryId) {
  try {
    const { data, error } = await supabase
      .from("enquiries")
      .select(
        `
        *,
        users:user_id (id, name, email, phone),
        enquiry_items(enquiry_id, product_id, product_name, price, quantity, customization),
        enquiry_replies(*)
      `
      )
      .eq("id", enquiryId)
      .single();

    if (error) throw error;

    // Sort replies by created_at
    if (data.enquiry_replies) {
      data.enquiry_replies.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
    }

    return { success: true, enquiry: data };
  } catch (error) {
    console.error("Error fetching enquiry with replies:", error);
    return { success: false, error: error.message };
  }
}

export async function addEnquiryReply(
  enquiryId,
  message,
  isAdmin = true,
  adminId = null
) {
  try {
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

    if (error) throw error;

    // Update enquiry status and admin_reply flag
    await supabase
      .from("enquiries")
      .update({
        status: "replied",
        admin_reply: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", enquiryId);

    return { success: true, reply: data };
  } catch (error) {
    console.error("Error adding enquiry reply:", error);
    return { success: false, error: error.message };
  }
}

export async function updateEnquiryStatus(
  enquiryId,
  status,
  adminNotes = null
) {
  try {
    const updateData = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (adminNotes) {
      updateData.admin_notes = adminNotes;
    }

    const { data, error } = await supabase
      .from("enquiries")
      .update(updateData)
      .eq("id", enquiryId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, enquiry: data };
  } catch (error) {
    console.error("Error updating enquiry status:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteEnquiry(enquiryId) {
  try {
    // Delete enquiry replies first
    await supabaseAdmin
      .from("enquiry_replies")
      .delete()
      .eq("enquiry_id", enquiryId);

    // Delete enquiry items
    await supabaseAdmin
      .from("enquiry_items")
      .delete()
      .eq("enquiry_id", enquiryId);

    // Delete enquiry
    const { error } = await supabase
      .from("enquiries")
      .delete()
      .eq("id", enquiryId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error deleting enquiry:", error);
    return { success: false, error: error.message };
  }
}

// WEBSITE SETTINGS
/**
 * Fetches all website settings or settings by category
 * @param {string} category - Optional category filter
 * @returns {Promise<{success: boolean, settings?: object, error?: string}>}
 */
export async function getWebsiteSettings(category = null) {
  let query = supabase.from("website_settings").select("*");

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) return { success: false, error: error.message };

  // Convert array to key-value object for easier access
  const settings = {};
  data.forEach((setting) => {
    settings[setting.key] = {
      value: setting.value,
      type: setting.type,
      category: setting.category,
      is_public: setting.is_public,
    };
  });

  return { success: true, settings };
}

/**
 * Updates a single website setting
 * @param {string} key - Setting key
 * @param {any} value - New value
 * @returns {Promise<{success: boolean, setting?: object, error?: string}>}
 */
export async function updateWebsiteSetting(key, value) {
  const { data, error } = await supabase
    .from("website_settings")
    .update({
      value: value,
      updated_at: new Date().toISOString(),
    })
    .eq("key", key)
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  return { success: true, setting: data };
}

/**
 * Updates multiple website settings at once
 * @param {Array} updates - Array of {key, value} objects
 * @returns {Promise<{success: boolean, settings?: Array, error?: string}>}
 */
export async function updateMultipleWebsiteSettings(updates) {
  const promises = updates.map((update) =>
    updateWebsiteSetting(update.key, update.value)
  );

  try {
    const results = await Promise.all(promises);
    const errors = results.filter((result) => !result.success);

    if (errors.length > 0) {
      return {
        success: false,
        error: `Failed to update ${errors.length} settings`,
      };
    }

    const settings = results.map((result) => result.setting);
    return { success: true, settings };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Gets settings by category with formatted structure for forms
 * @param {string} category - Category name
 * @returns {Promise<{success: boolean, settings?: Array, error?: string}>}
 */
export async function getSettingsByCategory(category) {
  const { data, error } = await supabase
    .from("website_settings")
    .select("*")
    .eq("category", category)
    .order("key");

  if (error) return { success: false, error: error.message };

  return { success: true, settings: data };
}

/**
 * Creates or updates a website setting
 * @param {Object} settingData - Setting data
 * @returns {Promise<{success: boolean, setting?: object, error?: string}>}
 */
export async function upsertWebsiteSetting(settingData) {
  const { data, error } = await supabase
    .from("website_settings")
    .upsert(settingData, { onConflict: "key" })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  return { success: true, setting: data };
}

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

  const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
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
export const getPromotionalSettings = async () => {
  try {
    const { data, error } = await supabase
      .from("promotional_settings")
      .select("*")
      .eq("is_active", true);

    if (error) throw error;

    // Convert to key-value pairs
    const settings = {};
    data.forEach((setting) => {
      settings[setting.setting_key] = setting.setting_value;
    });

    return { success: true, settings };
  } catch (error) {
    console.error("Error fetching promotional settings:", error);
    return { success: false, error: error.message };
  }
};

export const updatePromotionalSetting = async (key, value) => {
  try {
    const { error } = await supabaseAdmin.from("promotional_settings").upsert(
      {
        setting_key: key,
        setting_value: value,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "setting_key",
        ignoreDuplicates: false,
      }
    );

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error updating promotional setting:", error);
    return { success: false, error: error.message };
  }
};

export const updateMultiplePromotionalSettings = async (settings) => {
  try {
    const updates = Object.entries(settings).map(([key, value]) => ({
      setting_key: key,
      setting_value: value,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabaseAdmin
      .from("promotional_settings")
      .upsert(updates, {
        onConflict: "setting_key",
        ignoreDuplicates: false,
      });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error updating multiple promotional settings:", error);
    return { success: false, error: error.message };
  }
};

// PRINT REQUESTS MANAGEMENT
export async function getAllPrintRequests() {
  try {
    const { data, error } = await supabase
      .from("print_requests")
      .select(
        `
        *,
        users:user_id (
          id, name, email, phone, avatar,
          house_number, street_address, suite_unit_floor,
          locality, area, city, state, postal_code, country, landmark
        ),
        print_request_replies(*)
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, printRequests: data };
  } catch (error) {
    console.error("Error fetching print requests:", error);
    return { success: false, error: error.message };
  }
}

export async function getPrintRequestWithReplies(requestId) {
  try {
    const { data, error } = await supabase
      .from("print_requests")
      .select(
        `
        *,
        users:user_id (
          id, name, email, phone, avatar,
          house_number, street_address, suite_unit_floor,
          locality, area, city, state, postal_code, country, landmark
        ),
        print_request_replies(*)
      `
      )
      .eq("id", requestId)
      .single();

    if (error) throw error;

    // Sort replies by created_at
    if (data.print_request_replies) {
      data.print_request_replies.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
    }

    return { success: true, printRequest: data };
  } catch (error) {
    console.error("Error fetching print request with replies:", error);
    return { success: false, error: error.message };
  }
}

export async function addPrintRequestReply(
  requestId,
  message,
  isAdmin = true,
  adminId = null
) {
  try {
    const { data, error } = await supabase
      .from("print_request_replies")
      .insert([
        {
          print_request_id: requestId,
          message: message,
          is_admin: isAdmin,
          admin_id: adminId,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Update print request status if needed
    await supabase
      .from("print_requests")
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    return { success: true, reply: data };
  } catch (error) {
    console.error("Error adding print request reply:", error);
    return { success: false, error: error.message };
  }
}

export async function updatePrintRequestStatus(
  requestId,
  status,
  adminNote = null,
  estimatedPrice = null,
  finalPrice = null,
  priceNotes = null
) {
  try {
    const updateData = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (adminNote !== null) updateData.admin_note = adminNote;
    if (estimatedPrice !== null) updateData.estimated_price = estimatedPrice;
    if (finalPrice !== null) updateData.final_price = finalPrice;
    if (priceNotes !== null) updateData.price_notes = priceNotes;

    const { data, error } = await supabase
      .from("print_requests")
      .update(updateData)
      .eq("id", requestId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, printRequest: data };
  } catch (error) {
    console.error("Error updating print request status:", error);
    return { success: false, error: error.message };
  }
}

export async function updatePrintRequestPricing(
  requestId,
  estimatedPrice,
  finalPrice,
  priceNotes
) {
  try {
    const { data, error } = await supabase
      .from("print_requests")
      .update({
        estimated_price: estimatedPrice,
        final_price: finalPrice,
        price_notes: priceNotes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, printRequest: data };
  } catch (error) {
    console.error("Error updating print request pricing:", error);
    return { success: false, error: error.message };
  }
}

export async function deletePrintRequest(requestId) {
  try {
    // Delete print request replies first
    await supabase
      .from("print_request_replies")
      .delete()
      .eq("print_request_id", requestId);

    // Delete print request
    const { error } = await supabase
      .from("print_requests")
      .delete()
      .eq("id", requestId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error deleting print request:", error);
    return { success: false, error: error.message };
  }
}

// USER MANAGEMENT WITH DETAILED ADDRESS

/**
 * Add user with detailed address fields (Admin function)
 * @param {Object} user - User data with detailed address fields
 * @param {string} password - User password
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export async function addUserWithDetailedAddress(user, password) {
  // 1. Create Supabase Auth user
  const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
    email: user.email,
    password: password,
    options: {
      data: {
        name: user.name,
        role: user.role || "customer",
      },
    },
  });
  if (authError) {
    return { success: false, error: authError.message };
  }

  // 2. Insert into users table with detailed address fields
  const userProfile = {
    ...user,
    id: authData.user.id, // link by auth user id
    email: authData.user.email,
    // Convert frontend address fields to database fields
    house_number: user.houseNumber || null,
    street_address: user.streetAddress || null,
    suite_unit_floor: user.suiteUnitFloor || null,
    locality: user.locality || null,
    area: user.area || null,
    city: user.city || null,
    state: user.state || null,
    postal_code: user.postalCode || null,
    country: user.country || "India",
    landmark: user.landmark || null,
    // Map active to is_active for database compatibility
    is_active: user.active !== undefined ? user.active : true,
    created_at: new Date().toISOString(),
  };

  // Remove frontend-only fields that don't exist in database
  delete userProfile.houseNumber;
  delete userProfile.streetAddress;
  delete userProfile.suiteUnitFloor;
  delete userProfile.postalCode;
  delete userProfile.active;
  delete userProfile.fullAddress;

  const { data, error } = await supabase
    .from("users")
    .insert([userProfile])
    .select("*")
    .single();

  if (error) return { success: false, error: error.message };

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

  const fullAddress =
    addressParts.length > 0 ? addressParts.join(", ") : "No address provided";

  // Transform database fields to frontend-friendly names
  const transformedUser = {
    ...data,
    houseNumber: data.house_number,
    streetAddress: data.street_address,
    suiteUnitFloor: data.suite_unit_floor,
    postalCode: data.postal_code,
    active: data.is_active,
    fullAddress: fullAddress,
  };

  return { success: true, user: transformedUser };
}

/**
 * Update user with detailed address fields (Admin function)
 * @param {string} id - User ID
 * @param {Object} user - User data with detailed address fields
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export async function updateUserWithDetailedAddress(id, user) {
  // Convert frontend address fields to database fields if they exist
  const updateData = { ...user };

  if (user.houseNumber !== undefined)
    updateData.house_number = user.houseNumber;
  if (user.streetAddress !== undefined)
    updateData.street_address = user.streetAddress;
  if (user.suiteUnitFloor !== undefined)
    updateData.suite_unit_floor = user.suiteUnitFloor;
  if (user.locality !== undefined) updateData.locality = user.locality;
  if (user.area !== undefined) updateData.area = user.area;
  if (user.city !== undefined) updateData.city = user.city;
  if (user.state !== undefined) updateData.state = user.state;
  if (user.postalCode !== undefined) updateData.postal_code = user.postalCode;
  if (user.country !== undefined) updateData.country = user.country;
  if (user.landmark !== undefined) updateData.landmark = user.landmark;

  // Map active to is_active for database compatibility
  if (user.active !== undefined) updateData.is_active = user.active;

  // Remove frontend-only fields that don't exist in database
  delete updateData.houseNumber;
  delete updateData.streetAddress;
  delete updateData.suiteUnitFloor;
  delete updateData.postalCode;
  delete updateData.active;
  delete updateData.fullAddress;

  const { data, error } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return { success: false, error: error.message };

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

  const fullAddress =
    addressParts.length > 0 ? addressParts.join(", ") : "No address provided";

  // Transform database fields to frontend-friendly names
  const transformedUser = {
    ...data,
    houseNumber: data.house_number,
    streetAddress: data.street_address,
    suiteUnitFloor: data.suite_unit_floor,
    postalCode: data.postal_code,
    active: data.is_active,
    fullAddress: fullAddress,
  };

  return { success: true, user: transformedUser };
}

/**
 * Get all users with detailed address information (Admin function)
 * @returns {Promise<{success: boolean, users?: array, error?: string}>}
 */
export async function getAllUsersWithDetailedAddress() {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: error.message };

  // Transform each user's database fields to frontend-friendly names and construct full address
  const transformedUsers = data.map((u) => {
    // Construct full address from individual fields
    const addressParts = [
      u.house_number,
      u.street_address,
      u.suite_unit_floor,
      u.locality,
      u.area,
      u.city,
      u.state,
      u.postal_code,
      u.country,
      u.landmark,
    ].filter((part) => part && part.trim() !== "");

    const fullAddress =
      addressParts.length > 0 ? addressParts.join(", ") : "No address provided";

    return {
      ...u,
      houseNumber: u.house_number,
      streetAddress: u.street_address,
      suiteUnitFloor: u.suite_unit_floor,
      postalCode: u.postal_code,
      fullAddress: fullAddress,
      // Keep existing admin transformations
      active: u.is_active,
      joined: u.created_at ? formatDateOnlyIST(u.created_at) : null,
    };
  });

  return { success: true, users: transformedUsers };
}

// STORAGE MANAGEMENT
export async function getStorageUsage() {
  try {
    const { data: buckets, error: bucketsError } =
      await supabaseAdmin.storage.listBuckets();
    if (bucketsError) {
      return { success: false, error: bucketsError.message };
    }
    if (!buckets || buckets.length === 0) {
      return { success: false, error: "No buckets found" };
    }
    let totalUsage = 0;
    const bucketUsage = {};
    for (const bucket of buckets) {
      try {
        let bucketSize = 0;
        let fileCount = 0;
        const getAllFiles = async (path = "") => {
          const { data: items, error } = await supabaseAdmin.storage
            .from(bucket.name)
            .list(path, {
              limit: 1000,
              offset: 0,
              sortBy: { column: "name", order: "asc" },
            });
          if (error) {
            throw new Error(`[${bucket.name}/${path}] ${error.message}`);
          }
          if (!items) {
            return;
          }
          for (const item of items) {
            const itemPath = path ? `${path}/${item.name}` : item.name;
            if (item.metadata && item.metadata.size) {
              const size = item.metadata.size;
              bucketSize += size;
              fileCount++;
            } else if (
              item.metadata === null &&
              item.name &&
              !item.name.includes(".")
            ) {
              await getAllFiles(itemPath);
            }
          }
        };
        await getAllFiles();
        bucketUsage[bucket.name] = {
          size: bucketSize,
          files: fileCount,
          name: bucket.name,
          public: bucket.public || false,
        };
        totalUsage += bucketSize;
      } catch (err) {
        console.error(`Error processing bucket ${bucket.name}:`, err);
      }
    }
    const freeStorageLimit = 1 * 1024 * 1024 * 1024;
    const usagePercentage =
      totalUsage > 0 ? (totalUsage / freeStorageLimit) * 100 : 0;
    const result = {
      success: true,
      data: {
        totalUsage,
        totalUsageFormatted: formatBytes(totalUsage),
        freeStorageLimit,
        freeStorageLimitFormatted: formatBytes(freeStorageLimit),
        usagePercentage: Math.min(usagePercentage, 100),
        buckets: bucketUsage,
        bucketCount: buckets.length,
      },
    };
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export async function listBucketFiles(bucketName, folder = "") {
  try {
    const files = [];

    const getAllFiles = async (path = "") => {
      const { data: items, error } = await supabaseAdmin.storage
        .from(bucketName)
        .list(path, {
          limit: 1000,
          offset: 0,
          sortBy: { column: "updated_at", order: "desc" },
        });

      if (error) {
        console.error(`Error listing files in ${bucketName}/${path}:`, error);
        return;
      }

      if (items) {
        for (const item of items) {
          const itemPath = path ? `${path}/${item.name}` : item.name;

          if (item.metadata && item.metadata.size) {
            // It's a file
            const { data: urlData } = supabase.storage
              .from(bucketName)
              .getPublicUrl(itemPath);

            files.push({
              name: item.name,
              path: itemPath,
              size: item.metadata.size,
              sizeFormatted: formatBytes(item.metadata.size),
              lastModified: item.updated_at,
              contentType: item.metadata.mimetype || "unknown",
              isImage: (item.metadata.mimetype || "").startsWith("image/"),
              url: urlData.publicUrl,
              folder: path,
            });
          } else if (
            item.metadata === null &&
            item.name &&
            !item.name.includes(".")
          ) {
            // It's a folder, recurse if we want all files
            if (!folder || itemPath.startsWith(folder)) {
              await getAllFiles(itemPath);
            }
          }
        }
      }
    };

    await getAllFiles(folder);

    // Sort files by size (largest first) and then by name
    files.sort((a, b) => {
      if (b.size !== a.size) return b.size - a.size;
      return a.name.localeCompare(b.name);
    });

    return { success: true, data: files };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Delete a file from storage
export async function deleteStorageFile(bucketName, filePath) {
  try {
    const { error } = await supabaseAdmin.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getFileInfo(bucketName, filePath) {
  try {
    const { data: file, error } = await supabaseAdmin.storage
      .from(bucketName)
      .list(filePath.split("/").slice(0, -1).join("/") || "", {
        search: filePath.split("/").pop(),
      });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!file || file.length === 0) {
      return { success: false, error: "File not found" };
    }

    const fileInfo = file[0];

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    const result = {
      name: fileInfo.name,
      path: filePath,
      size: fileInfo.metadata?.size || 0,
      sizeFormatted: formatBytes(fileInfo.metadata?.size || 0),
      lastModified: fileInfo.updated_at,
      contentType: fileInfo.metadata?.mimetype || "unknown",
      isImage: (fileInfo.metadata?.mimetype || "").startsWith("image/"),
      url: urlData.publicUrl,
    };

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getStorageAnalytics() {
  try {
    // Get basic storage usage
    const storageResult = await getStorageUsage();
    if (!storageResult.success) {
      return storageResult;
    }

    const analytics = { ...storageResult.data };

    // Add additional insights
    analytics.insights = {
      largestFiles: [],
      oldestFiles: [],
      fileTypeBreakdown: {},
      recommendations: [],
    };

    // Get largest files across all buckets
    for (const [bucketName, bucketInfo] of Object.entries(analytics.buckets)) {
      const filesResult = await listBucketFiles(bucketName);
      if (filesResult.success) {
        const bucketFiles = filesResult.data;

        // Add to largest files (top 10)
        analytics.insights.largestFiles.push(
          ...bucketFiles.slice(0, 10).map((file) => ({
            ...file,
            bucket: bucketName,
          }))
        );

        // File type breakdown
        bucketFiles.forEach((file) => {
          const ext = file.name.split(".").pop()?.toLowerCase() || "unknown";
          if (!analytics.insights.fileTypeBreakdown[ext]) {
            analytics.insights.fileTypeBreakdown[ext] = {
              count: 0,
              size: 0,
              sizeFormatted: "0 B",
            };
          }
          analytics.insights.fileTypeBreakdown[ext].count++;
          analytics.insights.fileTypeBreakdown[ext].size += file.size;
          analytics.insights.fileTypeBreakdown[ext].sizeFormatted = formatBytes(
            analytics.insights.fileTypeBreakdown[ext].size
          );
        });
      }
    }

    // Sort largest files globally
    analytics.insights.largestFiles.sort((a, b) => b.size - a.size);
    analytics.insights.largestFiles = analytics.insights.largestFiles.slice(
      0,
      20
    );

    // Generate recommendations
    const usage = analytics.usagePercentage;
    if (usage > 90) {
      analytics.insights.recommendations.push({
        type: "critical",
        title: "Storage Almost Full",
        message: "Consider upgrading or removing unused files immediately.",
      });
    } else if (usage > 75) {
      analytics.insights.recommendations.push({
        type: "warning",
        title: "High Storage Usage",
        message: "Monitor usage closely and consider optimization.",
      });
    }

    // Check for large files
    const largeFiles = analytics.insights.largestFiles.filter(
      (f) => f.size > 5 * 1024 * 1024
    ); // 5MB+
    if (largeFiles.length > 0) {
      analytics.insights.recommendations.push({
        type: "info",
        title: "Large Files Detected",
        message: `Found ${largeFiles.length} files over 5MB. Consider compression.`,
      });
    }

    return { success: true, data: analytics };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
