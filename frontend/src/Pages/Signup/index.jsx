import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Indian states dropdown options
const indianStates = [
  { value: "Andhra Pradesh", label: "Andhra Pradesh" },
  { value: "Arunachal Pradesh", label: "Arunachal Pradesh" },
  { value: "Assam", label: "Assam" },
  { value: "Bihar", label: "Bihar" },
  { value: "Chhattisgarh", label: "Chhattisgarh" },
  { value: "Goa", label: "Goa" },
  { value: "Gujarat", label: "Gujarat" },
  { value: "Haryana", label: "Haryana" },
  { value: "Himachal Pradesh", label: "Himachal Pradesh" },
  { value: "Jharkhand", label: "Jharkhand" },
  { value: "Karnataka", label: "Karnataka" },
  { value: "Kerala", label: "Kerala" },
  { value: "Madhya Pradesh", label: "Madhya Pradesh" },
  { value: "Maharashtra", label: "Maharashtra" },
  { value: "Manipur", label: "Manipur" },
  { value: "Meghalaya", label: "Meghalaya" },
  { value: "Mizoram", label: "Mizoram" },
  { value: "Nagaland", label: "Nagaland" },
  { value: "Odisha", label: "Odisha" },
  { value: "Punjab", label: "Punjab" },
  { value: "Rajasthan", label: "Rajasthan" },
  { value: "Sikkim", label: "Sikkim" },
  { value: "Tamil Nadu", label: "Tamil Nadu" },
  { value: "Telangana", label: "Telangana" },
  { value: "Tripura", label: "Tripura" },
  { value: "Uttar Pradesh", label: "Uttar Pradesh" },
  { value: "Uttarakhand", label: "Uttarakhand" },
  { value: "West Bengal", label: "West Bengal" },
  { value: "Delhi", label: "Delhi" },
  { value: "Puducherry", label: "Puducherry" },
  { value: "Chandigarh", label: "Chandigarh" },
  {
    value: "Dadra and Nagar Haveli and Daman and Diu",
    label: "Dadra and Nagar Haveli and Daman and Diu",
  },
  { value: "Lakshadweep", label: "Lakshadweep" },
  { value: "Ladakh", label: "Ladakh" },
  { value: "Jammu and Kashmir", label: "Jammu and Kashmir" },
  {
    value: "Andaman and Nicobar Islands",
    label: "Andaman and Nicobar Islands",
  },
];

const Signup = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    accountType: 'individual',
    companyName: '',
    gstin: '',
    password: '',
    confirmPassword: '',
    // Legacy address field
    address: '',
    // Detailed address fields
    houseNumber: '',
    streetAddress: '',
    suiteUnitFloor: '',
    locality: '',
    area: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    landmark: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number - only allow digits
    if (name === 'phone') {
      const phoneValue = value.replace(/\D/g, ''); // Remove all non-digits
      if (phoneValue.length <= 10) { // Limit to 10 digits
        setFormData({
          ...formData,
          [name]: phoneValue
        });
      }
      return;
    }
    
    // Special handling for postal code - only allow digits
    if (name === 'postalCode') {
      const postalValue = value.replace(/\D/g, ''); // Remove all non-digits
      if (postalValue.length <= 6) { // Limit to 6 digits
        setFormData({
          ...formData,
          [name]: postalValue
        });
      }
      return;
    }
    
    // Special handling for GSTIN - convert to uppercase
    if (name === 'gstin') {
      setFormData({
        ...formData,
        [name]: value.toUpperCase()
      });
      return;
    }
    
    // Default handling for other fields
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // For radio/select account type
  const handleAccountTypeChange = (e) => {
    setFormData({
      ...formData,
      accountType: e.target.value,
      companyName: e.target.value === 'company' ? formData.companyName : '',
      gstin: e.target.value === 'company' ? formData.gstin : ''
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation - only letters and spaces allowed
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      newErrors.name = 'Name can only contain letters and spaces';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation - 10 digits starting with 6-9
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Phone number must be 10 digits starting with 6, 7, 8, or 9';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Address validation - require key fields for basic address
    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = 'Street address is required';
    } else if (formData.streetAddress.trim().length < 5) {
      newErrors.streetAddress = 'Street address must be at least 5 characters long';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.city.trim())) {
      newErrors.city = 'City can only contain letters and spaces';
    }
    
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    } else if (!/^\d{6}$/.test(formData.postalCode.trim())) {
      newErrors.postalCode = 'Postal code must be exactly 6 digits';
    }
    
    // Account type validation
    if (!formData.accountType) {
      newErrors.accountType = 'Please select account type';
    }
    
    // Company name validation if accountType is company
    if (formData.accountType === 'company' && !formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required for company accounts';
    } else if (formData.accountType === 'company' && formData.companyName.trim().length < 2) {
      newErrors.companyName = 'Company name must be at least 2 characters long';
    }
    
    // GSTIN validation if accountType is company
    if (formData.accountType === 'company' && !formData.gstin.trim()) {
      newErrors.gstin = 'GSTIN is required for company accounts';
    } else if (formData.accountType === 'company' && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin.trim())) {
      newErrors.gstin = 'Please enter a valid 15-character GSTIN';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      setAuthError('');
      
      try {
        const result = await register(
        formData.name,
        formData.email,
        formData.password,
        // Combine detailed address into legacy address field for backward compatibility
        `${formData.houseNumber} ${formData.streetAddress}, ${formData.suiteUnitFloor ? formData.suiteUnitFloor + ', ' : ''}${formData.locality ? formData.locality + ', ' : ''}${formData.area ? formData.area + ', ' : ''}${formData.city}, ${formData.state} ${formData.postalCode}`.replace(/,\s*,/g, ',').replace(/^,\s*/, '').replace(/,\s*$/, ''),
        formData.phone,
        formData.accountType,
        formData.accountType === 'company' ? formData.companyName : '',
        formData.accountType === 'company' ? formData.gstin : '',
        // Pass detailed address fields
        {
          houseNumber: formData.houseNumber,
          streetAddress: formData.streetAddress,
          suiteUnitFloor: formData.suiteUnitFloor,
          locality: formData.locality,
          area: formData.area,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          landmark: formData.landmark
        }
      );
        
        if (result.success) {
          // Reset form
          setFormData({
            name: '',
            email: '',
            phone: '',
            accountType: 'individual',
            companyName: '',
            gstin: '',
            password: '',
            confirmPassword: '',
            // Legacy address field
            address: '',
            // Detailed address fields
            houseNumber: '',
            streetAddress: '',
            suiteUnitFloor: '',
            locality: '',
            area: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'India',
            landmark: ''
          });
          
          // Redirect to homepage after successful registration
          navigate('/');
        } else {
          setAuthError(result.error || 'Registration failed. Please try again.');
        }
      } catch (error) {
        setAuthError('An unexpected error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <section className="py-8 md:py-16 bg-gray-50 md:mt-0 mt-[-2.7rem]">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-md">
          <h2 className="text-xl md:text-2xl font-semibold mb-6 text-center">Create an Account</h2>
          
          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                placeholder="Enter your full name"
                maxLength="50"
                required
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            
            {/* Email */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                placeholder="Enter your email address"
                maxLength="100"
                required
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Phone Number */}
            <div className="mb-4">
              <label htmlFor="phone" className="block text-gray-700 text-sm font-medium mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                placeholder="Enter your phone number"
                maxLength="10"
                pattern="[6-9][0-9]{9}"
                title="Phone number must be 10 digits starting with 6, 7, 8, or 9"
                required
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              
            </div>

            {/* Account Type */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Account Type <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="accountType"
                    value="individual"
                    checked={formData.accountType === 'individual'}
                    onChange={handleAccountTypeChange}
                    className="form-radio text-blue-600"
                    required
                  />
                  <span className="ml-2">Individual</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="accountType"
                    value="company"
                    checked={formData.accountType === 'company'}
                    onChange={handleAccountTypeChange}
                    className="form-radio text-blue-600"
                  />
                  <span className="ml-2">Company</span>
                </label>
              </div>
              {errors.accountType && <p className="text-red-500 text-xs mt-1">{errors.accountType}</p>}
            </div>

            {/* Company Details and GSTIN (shown when company is selected) */}
            {formData.accountType === 'company' && (
              <div className="mb-4 space-y-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
                <div>
                  <label htmlFor="companyName" className="block text-gray-700 text-sm font-medium mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors.companyName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    placeholder="Enter your company name"
                    maxLength="100"
                    required
                  />
                  {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
                </div>
                <div>
                  <label htmlFor="gstin" className="block text-gray-700 text-sm font-medium mb-2">
                    GSTIN <span className="text-red-500">*</span> <span className="text-gray-500">(15 characters)</span>
                  </label>
                  <input
                    type="text"
                    id="gstin"
                    name="gstin"
                    value={formData.gstin}
                    onChange={handleChange}
                    maxLength="15"
                    className={`w-full px-3 py-2 border ${errors.gstin ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    placeholder="Enter 15-character GSTIN"
                    pattern="[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}"
                    title="GSTIN format: 22AAAAA0000A1Z5"
                    required
                  />
                  {errors.gstin && <p className="text-red-500 text-xs mt-1">{errors.gstin}</p>}
                  <p className="text-gray-500 text-xs mt-1">Format: 22AAAAA0000A1Z5</p>
                </div>
              </div>
            )}

            {/* Address Section */}
            <div className="mb-6 p-4 border-2 border-gray-200 rounded-lg bg-gray-50 shadow-sm">
              <h3 className="text-lg font-medium text-gray-800 mb-4 border-b border-gray-300 pb-2">Address Information</h3>
              
              {/* House Number and Street Address */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="houseNumber" className="block text-gray-700 text-sm font-medium mb-2">
                    House No. <span className="text-gray-500">(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="houseNumber"
                    name="houseNumber"
                    value={formData.houseNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    placeholder="e.g., 123"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="streetAddress" className="block text-gray-700 text-sm font-medium mb-2">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="streetAddress"
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors.streetAddress ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white`}
                    placeholder="Street name and number"
                    required
                  />
                  {errors.streetAddress && <p className="text-red-500 text-xs mt-1">{errors.streetAddress}</p>}
                </div>
              </div>

              {/* Suite/Unit/Floor */}
              <div className="mb-4">
                <label htmlFor="suiteUnitFloor" className="block text-gray-700 text-sm font-medium mb-2">
                  Suite, Unit, Floor <span className="text-gray-500">(optional)</span>
                </label>
                <input
                  type="text"
                  id="suiteUnitFloor"
                  name="suiteUnitFloor"
                  value={formData.suiteUnitFloor}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  placeholder="e.g., Suite 101, Floor 2, Unit A"
                />
              </div>

              {/* Locality and Area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="locality" className="block text-gray-700 text-sm font-medium mb-2">
                    Locality <span className="text-gray-500">(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="locality"
                    name="locality"
                    value={formData.locality}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    placeholder="Locality/Neighborhood"
                  />
                </div>
                <div>
                  <label htmlFor="area" className="block text-gray-700 text-sm font-medium mb-2">
                    Area <span className="text-gray-500">(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="area"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    placeholder="Area/Zone"
                  />
                </div>
              </div>

              {/* City and Postal Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="city" className="block text-gray-700 text-sm font-medium mb-2">City <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white`}
                    placeholder="City"
                    required
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label htmlFor="postalCode" className="block text-gray-700 text-sm font-medium mb-2">Postal Code <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors.postalCode ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white`}
                    placeholder="Pin Code"
                    maxLength="6"
                    pattern="[0-9]{6}"
                    required
                  />
                  {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
                </div>
              </div>

              {/* State */}
              <div className="mb-4">
                <label htmlFor="state" className="block text-gray-700 text-sm font-medium mb-2">State <span className="text-red-500">*</span></label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.state ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white`}
                  required
                >
                  <option value="">Select a state</option>
                  {indianStates.map((state) => (
                    <option key={state.value} value={state.value}>{state.label}</option>
                  ))}
                </select>
                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
              </div>

              {/* Landmark */}
              <div className="mb-0">
                <label htmlFor="landmark" className="block text-gray-700 text-sm font-medium mb-2">
                  Landmark <span className="text-gray-500">(optional)</span>
                </label>
                <input
                  type="text"
                  id="landmark"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  placeholder="Nearby landmark for easy identification"
                />
              </div>
            </div>
            
            {/* Password */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                placeholder="Create a strong password"
                minLength="8"
                maxLength="128"
                required
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              <p className="text-gray-500 text-xs mt-1">
                Minimum 8 characters with uppercase, lowercase, and number
              </p>
            </div>
            
            {/* Confirm Password */}
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-medium mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                placeholder="Confirm your password"
                minLength="8"
                maxLength="128"
                required
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>
            
            <div className="mb-6">
              {authError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
                  {authError}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 font-medium"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
                  Sign in instead
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Signup;
