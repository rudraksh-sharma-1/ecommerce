import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const BusinessPartnerLogin = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    email: "",
    password: "",
    business_type: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://ecommerce-kghp.onrender.com/api/business/login",
        formData,
        {
          withCredentials: true,
        }
      );
      toast.success("Login Successfull!", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
      /* console.log(response.data); */
      // You can navigate to dashboard or store user in context here
    } catch (error) {
      toast.error("Error in Login!", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
    }
  };

  return (
    <div className="relative w-full flex items-center justify-center md:justify-end overflow-hidden">
      {/* Background Image (hidden on small screens) */}
      <img
        src="https://i.postimg.cc/XvL3Kv2w/processed-image.png"
        alt="Login Visual"
        className="hidden md:block absolute inset-0 w-full h-full object-cover z-0"
      />

      <div className="top-2 absolute md:top-5 md:left-5 text-[#0B1841] text-2xl font-bold tracking-wider z-200">
        BUSINESS <br className="hidden md:block" /> PARTNER
      </div>

      {/* Login Form */}
      <div className="relative z-20 w-full max-w-md bg-white px-6 py-10 md:px-10 md:py-10 rounded-[30px] shadow-2xl mx-4 md:mx-16 md:my-15 md:mb-50 mb-10">
        <h5 className="text-2xl md:text-3xl font-bold text-center text-[#0B1841] mb-8 leading-tight">
          LOGIN TO YOUR <br /> ACCOUNT
        </h5>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm text-[#0B1841] font-semibold mb-1">
              Username :
            </label>
            <input
              type="text"
              name="first_name"
              
              value={formData.first_name}
              onChange={handleChange}
              className="w-full rounded-full border border-gray-500 px-5 py-3 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm text-[#0B1841]  font-semibold mb-1">
              Email Address :
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-full border border-gray-500 px-5 py-3 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm text-[#0B1841] font-semibold mb-1">
              Password :
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-full px-5 py-3 border border-gray-500 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm text-[#0B1841] font-semibold mb-1">
              Business option :
            </label>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-4">
              {["Supplier", "B2B", "E-Partner", "Franchise/Distributor"].map(
                (type, i) => (
                  <label
                    key={i}
                    className="flex items-center space-x-2 text-sm text-[#0B1841] font-medium"
                  >
                    <input
                      type="radio"
                      name="business_type"
                      value={type}
                      checked={formData.business_type === type}
                      onChange={handleChange}
                      className="accent-blue-500"
                    />
                    <span>{type}</span>
                  </label>
                )
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-[#0B1841] text-white rounded-full py-3 font-semibold shadow-md"
          >
            LOGIN
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-black font-medium">
          Don’t have an account? <span className="underline cursor-pointer" ><Link to={'/BusinessPartnerSignup'}>Sign Up now</Link></span>
        </div>
      </div>
    </div>
  );
};

export default BusinessPartnerLogin;
