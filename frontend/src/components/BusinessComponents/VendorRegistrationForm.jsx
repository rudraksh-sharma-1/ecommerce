import React, { useState } from "react";
import { insertVendor } from "../../utils/vendorApi";

const VendorRegistrationForm = () => {
  const [formData, setFormData] = useState({
    legal_name: "",
    business_type: "",
    registration_type: "",
    products_services: "",
    website: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    region: "",
    postal_code: "",
    country: "",
    additional_info: "",
    representative_first: "",
    representative_last: "",
    pan: "",
    gstin: "",
    email: "",
    phone: "",
  });
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await insertVendor(formData);
      setSuccessMessage("Form submitted successfully!");
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      setFormData({
        legal_name: "",
        business_type: "",
        registration_type: "",
        products_services: "",
        website: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        region: "",
        postal_code: "",
        country: "",
        additional_info: "",
        representative_first: "",
        representative_last: "",
        pan: "",
        gstin: "",
        email: "",
        phone: "",
      }); // Optional: clear form
    } catch (err) {
      alert("Error submitting form");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h2 className="text-center text-2xl md:text-3xl font-semibold text-green-600 mb-10 tracking-wider uppercase">
        Become Our Vendor
      </h2>

      {successMessage ? (
            <p className="text-green-600 font-semibold mb-4">
              {successMessage}
            </p>
          ) :(
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your company’s legal name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-4 py-2"
            name="legal_name"
            value={formData.legal_name}
            onChange={handleChange}
          />
        </div>

        {/* Business Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business type
          </label>
          <div className="flex justify-center gap-6">
            {["Manufacturer", "Distributor", "Service provider"].map(
              (type, i) => (
                <label key={i} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="business_type"
                    className="accent-blue-500"
                    value={formData.business_type}
                    onChange={handleChange}
                  />
                  {type}
                </label>
              )
            )}
          </div>
        </div>

        {/* Registration Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Registration type
          </label>
          <div className="flex justify-center gap-6">
            {["Partnership", "PvtLtd/Ltd", "Others"].map((type, i) => (
              <label key={i} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="registration_type"
                  className="accent-blue-500"
                  value={formData.registration_type}
                  onChange={handleChange}
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        {/* Products/Services */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            What kind of products / services does your company offer?{" "}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-md px-4 py-2"
            rows={3}
            name="products_services"
            value={formData.products_services}
            onChange={handleChange}
          ></textarea>
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company website <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-4 py-2"
            name="website"
            value={formData.website}
            onChange={handleChange}
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company address <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Street Address"
              className="border border-gray-300 rounded-md px-4 py-2"
              name="address_line_1"
              value={formData.address_line_1}
              onChange={handleChange}
            />
            <input
              type="text"
              placeholder="Street Address Line 2"
              className="border border-gray-300 rounded-md px-4 py-2"
              name="address_line_2"
              value={formData.address_line_2}
              onChange={handleChange}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="City"
                className="border border-gray-300 rounded-md px-4 py-2"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
              <input
                type="text"
                placeholder="Region"
                className="border border-gray-300 rounded-md px-4 py-2"
                name="region"
                value={formData.region}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Postal/ Zip Code"
                className="border border-gray-300 rounded-md px-4 py-2"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
              />
              <select
                className="border border-gray-300 rounded-md px-4 py-2"
                name="country"
                value={formData.country}
                onChange={handleChange}
              >
                <option>Country</option>
                <option>India</option>
                <option>USA</option>
              </select>
            </div>
          </div>
        </div>

        {/* Company Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Please provide the following information: Year of incorporation,
            company size, major contracts handled
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-md px-4 py-2"
            rows={3}
            name="additional_info"
            value={formData.additional_info}
            onChange={handleChange}
          ></textarea>
        </div>

        {/* Person Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name of person representing the company{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="First"
              className="border border-gray-300 rounded-md px-4 py-2"
              name="representative_first"
              value={formData.representative_first}
              onChange={handleChange}
            />
            <input
              type="text"
              placeholder="Last"
              className="border border-gray-300 rounded-md px-4 py-2"
              name="representative_last"
              value={formData.representative_last}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* PAN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            PAN
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-4 py-2"
            placeholder="##########"
            name="pan"
            value={formData.pan}
            onChange={handleChange}
          />
        </div>

        {/* PAN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            GSTIN
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-4 py-2"
            placeholder="##########"
            name="gstin"
            value={formData.gstin}
            onChange={handleChange}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded-md px-4 py-2"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact phone
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-4 py-2"
            placeholder="##########"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        {/* Submit */}
        <div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-md transition"
            >
              Register Vendor
            </button>

          <p className="text-xs text-gray-500 text-center mt-2">
            Never submit sensitive information such as passwords.{" "}
            <a href="#" className="text-blue-500 underline">
              Report abuse
            </a>
          </p>
        </div>
      </form>)}
    </div>
  );
};

export default VendorRegistrationForm;
