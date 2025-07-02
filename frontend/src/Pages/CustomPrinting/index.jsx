import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  createPrintRequest,
  createPrintRequestWithEnquiry,
  getUserProfile,
} from "../../utils/supabaseApi";
import { formatDateOnlyIST } from "../../utils/dateUtils";

const CustomPrinting = () => {
  const [selectedItem, setSelectedItem] = useState("tshirt");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [customOptions, setCustomOptions] = useState({
    size: "M",
    color: "white",
    quantity: 1,
    position: "front",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [userRequests, setUserRequests] = useState([]);
  const { currentUser, loading } = useAuth();

  const navigate = useNavigate();

  // Product information with pricing
  const products = {
    tshirt: {
      name: "Custom T-Shirt",
      basePrice: 599,
      description: "High-quality cotton t-shirt customized with your design",
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["white", "black", "blue", "red", "grey"],
      image: "/tshirt.jpg",
      placeholder: "https://placehold.co/400x400?text=T-Shirt",
    },
    hoodie: {
      name: "Custom Hoodie",
      basePrice: 899,
      description: "Warm and comfortable hoodie with your personalized design",
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["black", "white", "grey", "navy"],
      image: "/hoodie.jpg",
      placeholder: "https://placehold.co/400x400?text=Hoodie",
    },
    mug: {
      name: "Custom Mug",
      basePrice: 299,
      description: "Ceramic mug that showcases your design in vibrant colors",
      sizes: ["Standard"],
      colors: ["white", "black"],
      image: "/mug.jpg",
      placeholder: "https://placehold.co/400x400?text=Mug",
    },
    diary: {
      name: "Custom Diary",
      basePrice: 349,
      description:
        "Premium quality diary with your logo or design on the cover",
      sizes: ["A5", "A4"],
      colors: ["brown", "black", "blue"],
      image: "/diary.jpg",
      placeholder: "https://placehold.co/400x400?text=Diary",
    },
  };

  // Handle file upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB
        alert("File size exceeds 5MB. Please choose a smaller file.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(file);
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle option changes
  const handleOptionChange = (e) => {
    const { name, value } = e.target;
    setCustomOptions({
      ...customOptions,
      [name]: value,
    });
  };

  // Reset when changing product
  const handleProductChange = (product) => {
    setSelectedItem(product);
    // Reset size to first available size for this product
    setCustomOptions({
      ...customOptions,
      size: products[product].sizes[0],
    });
  };

  // Calculate total price
  const calculatePrice = () => {
    let price = products[selectedItem].basePrice;

    // Add premium for certain sizes
    if (selectedItem === "tshirt" || selectedItem === "hoodie") {
      if (customOptions.size === "XL") price += 50;
      if (customOptions.size === "XXL") price += 100;
    }

    // Multiply by quantity
    price *= customOptions.quantity;

    return price;
  };

  // Fetch user's printing requests if logged in
  useEffect(() => {
    if (currentUser && currentUser.id) {
      fetchUserPrintingRequests(currentUser.id);
    }
  }, [currentUser]);

  // Fetch user's printing requests
  const fetchUserPrintingRequests = async (userId) => {
    try {
      const result = await getUserPrintingRequests(userId);
      if (result.success) {
        setUserRequests(result.requests);
      }
    } catch (error) {
      console.error("Error fetching user printing requests:", error);
    }
  };

  // Submit printing request
  const submitPrintingRequest = async () => {
    if (!currentUser || loading) {
      // Redirect to login page if user is not logged in
      navigate("/login");
      return;
    }

    if (!uploadedImage) {
      setSubmitError("Please upload a logo or image first.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      let userProfile = null;
      try {
        const profileResult = await getUserProfile(currentUser.id);
        if (profileResult.success) {
          userProfile = profileResult.user;
        }
      } catch (error) {
        // Continue without profile
      }

      const result = await createPrintRequestWithEnquiry({
        userId: currentUser.id,
        productType: selectedItem,
        size: customOptions.size,
        color: customOptions.color,
        quantity: customOptions.quantity,
        position: customOptions.position,
        imageFile: uploadedImage,
        name:
          userProfile?.name ||
          currentUser?.name ||
          currentUser?.user_metadata?.name ||
          "Custom Print Customer",
        email: userProfile?.email || currentUser?.email || "",
        phone: userProfile?.phone || currentUser?.user_metadata?.phone || null,
        totalPrice: calculatePrice(), // Pass the calculated price
      });

      if (result.success) {
        setSubmitSuccess(true);
        setUploadedImage(null);
        setPreviewUrl(null);
        // Refresh user's printing requests
        if (currentUser.id) fetchUserPrintingRequests(currentUser.id);
      } else {
        setSubmitError(result.error || "Failed to submit printing request.");
      }
    } catch (error) {
      console.error("Error submitting printing request:", error);
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add to cart function
  const addToCart = () => {
    if (!uploadedImage) {
      setSubmitError("Please upload a logo or image first.");
      return;
    }
    submitPrintingRequest();
  };

  return (
    <div className="bg-white py-8 sm:py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
          Custom Printing Services
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-10">
          Upload your design and customize products with your logo or image.
        </p>

        {/* Product Selection Tabs - Scrollable on mobile */}
        <div className="mb-6 sm:mb-10 overflow-x-auto pb-2">
          <div className="border-b border-gray-200 min-width-full whitespace-nowrap">
            <nav className="flex space-x-4 sm:space-x-8" aria-label="Products">
              {Object.keys(products).map((key) => (
                <button
                  key={key}
                  onClick={() => handleProductChange(key)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm ${
                    selectedItem === key
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  style={{
                    color: selectedItem === key ? "#3f51b5" : "",
                    borderColor: selectedItem === key ? "#3f51b5" : "",
                  }}
                >
                  {products[key].name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
          {/* Product Preview */}
          <div className="md:w-1/2">
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg text-center">
              <div className="relative mb-4 max-w-xs mx-auto sm:max-w-none">
                <img
                  src={products[selectedItem].image}
                  alt={products[selectedItem].name}
                  className="h-64 sm:h-80 w-auto mx-auto object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = products[selectedItem].placeholder;
                  }}
                />

                {/* Display uploaded logo on the product */}
                {previewUrl && (
                  <div
                    className="absolute"
                    style={{
                      width: "30%",
                      height: "30%",
                      top: customOptions.position === "front" ? "30%" : "65%",
                      left:
                        customOptions.position === "left"
                          ? "15%"
                          : customOptions.position === "right"
                          ? "55%"
                          : "35%",
                    }}
                  >
                    <img
                      src={previewUrl}
                      alt="Your design"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>

              <h3 className="text-lg font-medium mb-2">
                {products[selectedItem].name}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                {products[selectedItem].description}
              </p>

              {/* Upload Section */}
              <div className="mt-5 p-3 sm:p-4 border border-dashed border-gray-300 rounded-lg">
                <h4 className="font-medium mb-2 text-sm sm:text-base">
                  Upload Your Logo or Design
                </h4>
                <p className="text-xs sm:text-sm text-gray-500 mb-3">
                  Supported formats: PNG, JPG (Max size: 5MB)
                </p>

                <div className="flex flex-col items-center">
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md mb-3 text-sm sm:text-base">
                    <span>Select File</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".png,.jpg,.jpeg"
                      onChange={handleImageUpload}
                    />
                  </label>

                  {uploadedImage && (
                    <div className="mt-2 text-xs sm:text-sm text-gray-600">
                      File: {uploadedImage.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Customization Options */}
          <div className="md:w-1/2 mt-6 md:mt-0">
            <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">
                Customize Your {products[selectedItem].name}
              </h2>

              {/* Size Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {products[selectedItem].sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() =>
                        setCustomOptions({ ...customOptions, size })
                      }
                      className={`px-4 py-2 border rounded-md text-sm ${
                        customOptions.size === size
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                      style={{
                        backgroundColor:
                          customOptions.size === size ? "#3f51b5" : "",
                        borderColor:
                          customOptions.size === size ? "#3f51b5" : "",
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-3">
                  {products[selectedItem].colors.map((color) => (
                    <button
                      key={color}
                      onClick={() =>
                        setCustomOptions({ ...customOptions, color })
                      }
                      className={`w-8 h-8 rounded-full border ${
                        customOptions.color === color
                          ? "ring-2 ring-primary ring-offset-2"
                          : "border-gray-300"
                      }`}
                      style={{
                        backgroundColor: color,
                        ringColor: "#3f51b5",
                      }}
                      title={color.charAt(0).toUpperCase() + color.slice(1)}
                    />
                  ))}
                </div>
              </div>

              {/* Logo Position (only for wearables) */}
              {(selectedItem === "tshirt" || selectedItem === "hoodie") && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo Position
                  </label>
                  <select
                    name="position"
                    value={customOptions.position}
                    onChange={handleOptionChange}
                    className="w-full p-2 border border-gray-300 rounded-md bg-white"
                  >
                    <option value="front">Front Center</option>
                    <option value="back">Back Center</option>
                    <option value="left">Left Chest</option>
                    <option value="right">Right Chest</option>
                  </select>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex">
                  <button
                    onClick={() =>
                      setCustomOptions({
                        ...customOptions,
                        quantity: Math.max(1, customOptions.quantity - 1),
                      })
                    }
                    className="px-3 py-1 border border-gray-300 rounded-l-md bg-gray-50"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    value={customOptions.quantity}
                    onChange={handleOptionChange}
                    className="w-16 text-center border-t border-b border-gray-300"
                  />
                  <button
                    onClick={() =>
                      setCustomOptions({
                        ...customOptions,
                        quantity: customOptions.quantity + 1,
                      })
                    }
                    className="px-3 py-1 border border-gray-300 rounded-r-md bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Price & Add to Cart */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium">Total Price:</span>
                  <span className="text-2xl font-bold">
                    ₹{calculatePrice().toFixed(2)}
                  </span>
                </div>

                {submitError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
                    {submitError}
                  </div>
                )}

                {submitSuccess && (
                  <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-md">
                    <div className="font-medium">
                      Your printing request has been submitted successfully!
                    </div>
                    <div className="mt-1">
                      We'll process it shortly and you can track progress via
                      the chat system. Check your
                      <Link
                        to="/enquiry-history"
                        className="text-green-800 underline ml-1"
                      >
                        enquiry history
                      </Link>{" "}
                      to continue the conversation with our team.
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={addToCart}
                    disabled={isSubmitting}
                    className="flex-1 bg-primary text-white py-3 px-6 rounded-md hover:bg-primary-dark transition duration-200 disabled:opacity-70"
                    style={{ backgroundColor: "#3f51b5" }}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Print Request"}
                  </button>

                  {!!currentUser ? (
                    <Link
                      to="/account"
                      className="flex-1 border border-gray-300 text-gray-700 text-center py-3 px-6 rounded-md hover:bg-gray-50 transition duration-200"
                    >
                      View My Requests
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className="flex-1 border border-gray-300 text-gray-700 text-center py-3 px-6 rounded-md hover:bg-gray-50 transition duration-200"
                    >
                      Login to Continue
                    </Link>
                  )}
                </div>

                <p className="text-sm text-gray-500 mt-4">
                  * Design preview is for representation only. Actual print may
                  vary slightly.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-12 md:mt-16">
          <h2 className="text-xl md:text-2xl font-semibold mb-6">
            Custom Printing Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Print Quality</h3>
              <p className="text-gray-700 text-sm md:text-base">
                We use high-quality digital printing technology to ensure
                vibrant, long-lasting designs on all our products.
              </p>
            </div>

            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Design Guidelines</h3>
              <p className="text-gray-700 text-sm md:text-base">
                For best results, upload high-resolution images (300 DPI) with
                transparent backgrounds for logos.
              </p>
            </div>

            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Bulk Orders</h3>
              <p className="text-gray-700 text-sm md:text-base">
                Special pricing available for bulk orders of 10+ items. Contact
                us for corporate and event packages.
              </p>
            </div>
          </div>

          {/* Recent Printing Requests */}
          {!!currentUser && userRequests.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl md:text-2xl font-semibold mb-6">
                Your Recent Printing Requests
              </h2>

              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead>
                    <tr>
                      <th className="py-3 px-4 border-b text-left">Product</th>
                      <th className="py-3 px-4 border-b text-left">Options</th>
                      <th className="py-3 px-4 border-b text-left">Price</th>
                      <th className="py-3 px-4 border-b text-left">Status</th>
                      <th className="py-3 px-4 border-b text-left">Date</th>
                      <th className="py-3 px-4 border-b text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userRequests.slice(0, 3).map((request) => (
                      <tr key={request.id}>
                        <td className="py-3 px-4 border-b">
                          {request.product_type
                            ? `Custom ${
                                request.product_type.charAt(0).toUpperCase() +
                                request.product_type.slice(1)
                              }`
                            : "Custom Product"}
                        </td>
                        <td className="py-3 px-4 border-b">
                          <div className="text-sm">
                            <div>Size: {request.size || "N/A"}</div>
                            <div>Color: {request.color || "N/A"}</div>
                            <div>Qty: {request.quantity || 1}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 border-b">
                          <div className="text-sm">
                            {request.estimated_price > 0 && (
                              <div className="text-green-600 font-medium">
                                Est: ₹{request.estimated_price}
                              </div>
                            )}
                            {request.final_price > 0 && (
                              <div className="text-blue-600 font-semibold">
                                Final: ₹{request.final_price}
                              </div>
                            )}
                            {!request.estimated_price &&
                              !request.final_price && (
                                <span className="text-gray-500">
                                  Pending Quote
                                </span>
                              )}
                          </div>
                        </td>
                        <td className="py-3 px-4 border-b">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              request.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : request.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : request.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {request.status.charAt(0).toUpperCase() +
                              request.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 border-b">
                          {request.created_at
                            ? formatDateOnlyIST(new Date(request.created_at))
                            : "N/A"}
                        </td>
                        <td className="py-3 px-4 border-b">
                          {request.enquiry_id && (
                            <Link
                              to="/enquiry-history"
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Chat
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {userRequests.length > 3 && (
                <div className="mt-4 text-center">
                  <Link
                    to="/account"
                    className="text-primary hover:text-primary-dark font-medium"
                    style={{ color: "#3f51b5" }}
                  >
                    View All Requests
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomPrinting;
