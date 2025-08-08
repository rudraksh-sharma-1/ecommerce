import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const BusinessPartnerSignup = () => {
  const notify = () =>
    toast.success("Signup Successfull!", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  const notify2 = () =>
    toast.error("Signup Failed", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  const Navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_no: "",
    email: "",
    pan: "",
    gstin: "",
    adhaar_no: "",
    password: "",
    business_type: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.business_type === "") {
      alert("Please select a business type.");
      return;
    }
    try {
      const response = await axios.post(
        "https://ecommerce-8342.onrender.com/api/business/signup",
        formData,
        {
          withCredentials: true,
        }
      );
      notify(); // Show toast
      Navigate("/BusinessPartner");
      /* console.log(response.data); */
      // You can navigate to dashboard or store user in context here
    } catch (error) {
      notify2(); // Show toast for error
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gray-100">
      {/* Left Side Form in Card Box */}
      <div className=" max-w-3xl bg-white shadow-2xl rounded-2xl p-8 md:p-12 mx-4 my-10">
        <h2 className="text-3xl md:text-4xl font-bold text-black text-center mb-2">
          Nice to meet you!
        </h2>
        <p className="text-xl text-[#0B1841] text-center mb-8">
          Let’s get Started
        </p>

        <form
          onSubmit={handleSignup}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="text-sm font-medium">First Name</label>
            <input
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              type="text"
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Last Name</label>
            <input
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              type="text"
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Phone number</label>
            <input
              name="phone_no"
              value={formData.phone_no}
              onChange={handleChange}
              type="text"
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium">GSTIN</label>
            <input
              name="gstin"
              value={formData.gstin}
              onChange={handleChange}
              type="text"
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
              placeholder="#########"
            />
          </div>
          <div>
            <label className="text-sm font-medium">PAN</label>
            <input
              name="pan"
              value={formData.pan}
              onChange={handleChange}
              type="text"
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
              placeholder="#########"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Adhaar No</label>
            <input
              name="adhaar_no"
              value={formData.adhaar_no}
              onChange={handleChange}
              type="text"
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
              placeholder="##########"
            />
          </div>

          <div>
            <label className="block text-sm text-[#0B1841] font-semibold mb-1">
              Partner option:
            </label>
            <select
              name="business_type"
              value={formData.business_type}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-md text-sm text-[#0B1841] bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Select Partner Type</option>
              <option value="Supplier">Supplier</option>
              <option value="B2B">B2B</option>
              <option value="E-Partner">E-Partner</option>
              <option value="Franchise/Distributor">
                Franchise/Distributor
              </option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              name="password"
              value={formData.password}
              onChange={handleChange}
              type="password"
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
              placeholder="********"
            />
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex flex-col justify-center items-center gap-4 mt-4">
            <button
              type="submit"
              className="w-full md:w-auto bg-[#0B1841] text-white px-15 py-2 rounded-full font-medium shadow-md"
            >
              Sign up
            </button>
            <span>
              Already have an account?{" "}
              <Link
                to={"/BusinessPartner"}
                className="underline cursor-pointer"
              >
                LogIn
              </Link>
            </span>
          </div>
        </form>
      </div>

      {/* Right Side Image - Hidden on mobile */}
      {/* <div className="hidden md:flex md:w-1/2 items-center justify-center p-6">
        <img
          src="https://i.postimg.cc/QtNJsM1M/Screenshot-2025-07-10-172425.png"
          alt="Visual"
          className="object-contain max-w-md h-auto"
        />
      </div> */}
    </div>
  );
};

export default BusinessPartnerSignup;
