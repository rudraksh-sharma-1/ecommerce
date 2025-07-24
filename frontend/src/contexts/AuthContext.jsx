import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import supabase from '../utils/supabase.ts';
import { createUserProfileWithAddress } from '../utils/supabaseApi.js';
import { useLocationContext } from './LocationContext.jsx';


// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session) {
        // Always merge user_metadata into user and ensure email is preserved
        const user = data.session.user;
        const name = user?.user_metadata?.name;
        /* console.log('Initial session user data:', user);
        console.log('User email from session:', user.email); */
        setCurrentUser({ 
          ...user, 
          name,
          email: user.email // Explicitly ensure email is available
        });
        setLoading(false);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    };
    getSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const user = session.user;
        const name = user?.user_metadata?.name;
        /* console.log('Auth state change user data:', user);
        console.log('User email from auth state change:', user.email); */
        setCurrentUser({ 
          ...user, 
          name,
          email: user.email // Explicitly ensure email is available
        });
      } else {
        setCurrentUser(null);
      }
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Supabase login
  const loginUser = async (email, password) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Merge user_metadata for name and ensure email is available
      const user = data.user;
      const name = user?.user_metadata?.name;
      setCurrentUser({ 
        ...user, 
        name,
        email: user.email // Explicitly ensure email is available
      });
      return { success: true, user: { ...user, name, email: user.email } };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Supabase register
  const registerUser = async (name, email, password, phone = '', accountType = 'individual', companyName = '', gstin = '', detailedAddress = {}) => {
    try {
      setError(null);
      // 1. Register with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, phone, companyName, accountType, gstin, role: 'customer' } }
      });
      if (error) throw error;
      const authUser = data.user;
      if (!authUser) throw new Error('No user returned from Auth');
      
      // 2. Insert into users table using createUserProfileWithAddress, passing Auth id
      const userProfile = {
        id: authUser.id,
        email,
        name,
        phone,
        account_type: accountType,
        // Add detailed address fields using frontend naming
        houseNumber: detailedAddress.houseNumber || '',
        streetAddress: detailedAddress.streetAddress || '',
        suiteUnitFloor: detailedAddress.suiteUnitFloor || '',
        locality: detailedAddress.locality || '',
        area: detailedAddress.area || '',
        city: detailedAddress.city || '',
        state: detailedAddress.state || '',
        postalCode: detailedAddress.postalCode || '',
        country: detailedAddress.country || 'India',
        landmark: detailedAddress.landmark || '',
        company_name: accountType === 'company' ? companyName : null,
        gstin: accountType === 'company' ? gstin : null,
        role: 'customer',
        is_active: true,
        avatar: null,
        photo_url: null
      };
      
      const addResult = await createUserProfileWithAddress(userProfile);
      if (!addResult.success) {
        setError(addResult.error);
        return { success: false, error: addResult.error };
      }
      
      // Set currentUser directly from authUser after successful signup and DB insert
      const userName = authUser.user_metadata?.name || name;
      setCurrentUser({ ...authUser, name: userName });
      return { success: true, user: { ...authUser, name: userName } };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Supabase logout
  const logoutUser = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      clearLocationData();
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Supabase reset password
  const resetPassword = async (email) => {
    try {
      console.log('Reset password called with email:', email);
      if (!email || email.trim() === '') {
        throw new Error('Email is required for password reset');
      }
      
      // Determine the correct redirect URL based on environment
      let redirectUrl;
      if (window.location.hostname === 'shop.psetu.com') {
        redirectUrl = 'https://shop.psetu.com/reset-password';
      } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        redirectUrl = `${window.location.origin}/reset-password`;
      } else {
        // For any other domain, use the current origin
        redirectUrl = `${window.location.origin}/reset-password`;
      }
      
      console.log('Redirect URL:', redirectUrl);
      console.log('Current hostname:', window.location.hostname);
      console.log('Current origin:', window.location.origin);
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });
      console.log('Supabase reset response:', { data, error });
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Supabase update password (for logged-in users)
  const updatePassword = async (newPassword) => {
    try {
      setError(null);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const value = {
    currentUser,
    userRole,
    isAdmin: userRole === 'admin',
    isAuthenticated: !!currentUser,
    loading,
    error,
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
    resetPassword,
    updatePassword,
    setCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
