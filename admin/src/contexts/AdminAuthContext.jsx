import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import supabase from '../utils/supabase';

// Create context
const AdminAuthContext = createContext();

// Custom hook to use the auth context
export const useAdminAuth = () => useContext(AdminAuthContext);

// Session timeout in milliseconds (15 minutes for admin security)
const ADMIN_SESSION_TIMEOUT = 15 * 60 * 1000;

// Provider component
export const AdminAuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);

  // Function to start the session timeout
  const startSessionTimeout = () => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set a new timeout
    timeoutRef.current = setTimeout(() => {
      // Log the user out when the session expires
      logoutUser();
    }, ADMIN_SESSION_TIMEOUT);
  };

  // Reset the session timeout on user activity
  const resetSessionTimeout = () => {
    if (currentUser && isAdmin) {
      startSessionTimeout();
    }
  };

  // Add event listeners for user activity
  useEffect(() => {
    if (currentUser && isAdmin) {
      // Start the initial timeout
      startSessionTimeout();
      
      // Events that reset the timeout
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      
      // Add event listeners
      events.forEach(event => {
        window.addEventListener(event, resetSessionTimeout);
      });
      
      // Clean up event listeners
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        events.forEach(event => {
          window.removeEventListener(event, resetSessionTimeout);
        });
      };
    }
  }, [currentUser, isAdmin]);
  
  useEffect(() => {
    setLoading(true);
    async function checkSession() {
      const { data, error } = await supabase.auth.getSession();
      const session = data?.session;
      if (session && session.user) {
        setCurrentUser(session.user);
        setIsAdmin(session.user.user_metadata?.role === 'admin');
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    }
    checkSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && session.user) {
        setCurrentUser(session.user);
        setIsAdmin(session.user.user_metadata?.role === 'admin');
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Authentication functions
  const loginUser = async (email, password) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }
      if (data.session && data.user) {
        setCurrentUser(data.user);
        setIsAdmin(data.user.user_metadata?.role === 'admin');
        startSessionTimeout();
        return { success: true, user: data.user, isAdmin: data.user.user_metadata?.role === 'admin' };
      }
      return { success: false, error: 'Invalid credentials' };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const registerAdminUser = async (name, email, password) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { displayName: name, role: 'admin' } }
      });
      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }
      if (data.user) {
        setCurrentUser(data.user);
        setIsAdmin(true);
        startSessionTimeout();
        return { success: true, user: data.user };
      }
      return { success: false, error: 'Registration failed' };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const logoutUser = async () => {
    try {
      await supabase.auth.signOut();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setCurrentUser(null);
      setIsAdmin(false);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Context value
  const value = {
    currentUser,
    isAdmin,
    isAuthenticated: !!currentUser && isAdmin,
    loading,
    error,
    login: loginUser,
    register: registerAdminUser,
    logout: logoutUser,
    resetSessionTimeout
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {!loading && children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthContext;
