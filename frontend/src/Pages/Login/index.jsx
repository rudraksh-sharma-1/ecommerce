import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const { login, resetPassword } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
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
        const result = await login(formData.email, formData.password);
        
        if (result.success) {
          // Reset form
          setFormData({
            email: '',
            password: ''
          });
          
          // Redirect to homepage after successful login
          navigate('/');
        } else {
          setAuthError(result.error || 'Login failed. Please try again.');
        }
      } catch (error) {
        setAuthError('An unexpected error occurred. Please try again.');
        console.error('Login error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setAuthError('Please enter your email address first, then click "Forgot Password"');
      return;
    }

    setResetLoading(true);
    setResetMessage('');
    setAuthError('');

    try {
      const result = await resetPassword(formData.email);
      if (result.success) {
        setResetMessage('Password reset email sent! Check your inbox and follow the link to reset your password.');
      } else {
        setAuthError(result.error || 'Failed to send reset email. Please try again.');
      }
    } catch (error) {
      setAuthError('An error occurred while sending reset email. Please try again.');
      console.error('Reset password error:', error);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <section className="py-8 md:py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white p-6 md:p-8 rounded-lg shadow-md">
          <h2 className="text-xl md:text-2xl font-semibold mb-6 text-center">Login to Your Account</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-primary`}
                placeholder="Enter your email"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-primary`}
                placeholder="Enter your password"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center mb-3 sm:mb-0">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              
              <div className="text-sm">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="font-medium text-primary hover:text-primary-dark disabled:opacity-50"
                  style={{ color: '#3f51b5' }}
                  disabled={resetLoading}
                >
                  {resetLoading ? 'Sending...' : 'Forgot your password?'}
                </button>
              </div>
            </div>
            
            <div className="mb-6">
              {resetMessage && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-md">
                  {resetMessage}
                </div>
              )}
              {authError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
                  {authError}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-200"
                style={{ backgroundColor: '#3f51b5' }}
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium text-primary hover:text-primary-dark" style={{ color: '#3f51b5' }}>
                  Sign up now
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Login;
