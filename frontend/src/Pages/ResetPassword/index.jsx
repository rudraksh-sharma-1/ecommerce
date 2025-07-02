import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import supabase from '../../utils/supabase.ts';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updatePassword, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });

  useEffect(() => {
    if (currentUser) {
      setNotification({ 
        show: true, 
        message: 'You can now set your new password below.', 
        type: 'success' 
      });
      return;
    }

    const checkForTokens = () => {
      let accessToken = searchParams.get('access_token');
      let refreshToken = searchParams.get('refresh_token');
      let type = searchParams.get('type');
      let token = searchParams.get('token');

      if (!accessToken || !refreshToken || !type) {
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        accessToken = hashParams.get('access_token');
        refreshToken = hashParams.get('refresh_token');
        type = hashParams.get('type');
        if (!token) token = hashParams.get('token');
      }

      if (type === 'recovery' && accessToken && refreshToken) {
        const setSession = async () => {
          try {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            if (error) {
              setNotification({ show: true, message: 'Invalid or expired reset link. Please request a new password reset.', type: 'danger' });
            } else {
              setNotification({ show: true, message: 'Ready to reset your password. Please enter your new password below.', type: 'success' });
            }
          } catch (err) {
            setNotification({ show: true, message: 'Error processing reset link. Please request a new password reset.', type: 'danger' });
          }
        };
        setSession();
      } else if (type === 'recovery' && token) {
        // Exchange the token for a session (for magic link/recovery)
        const exchangeSession = async () => {
          try {
            const { error } = await supabase.auth.exchangeCodeForSession({ authCode: token });
            if (error) {
              setNotification({ show: true, message: 'Invalid or expired reset link (token exchange failed). Please request a new password reset.', type: 'danger' });
            } else {
              setNotification({ show: true, message: 'Ready to reset your password. Please enter your new password below.', type: 'success' });
            }
          } catch (err) {
            setNotification({ show: true, message: 'Error processing reset link (token exchange). Please request a new password reset.', type: 'danger' });
          }
        };
        exchangeSession();
      } else {
        // No valid reset tokens found and no user logged in
        setNotification({ 
          show: true, 
          message: 'Invalid reset link. Please go to the login page and request a new password reset.', 
          type: 'danger' 
        });
      }
    };

    checkForTokens();
    const handleHashChange = () => {
      checkForTokens();
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [searchParams, currentUser]);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setNotification({ show: true, message: 'Please fill all password fields', type: 'danger' });
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setNotification({ show: true, message: 'Passwords do not match', type: 'danger' });
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setNotification({ show: true, message: 'Password must be at least 6 characters', type: 'danger' });
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
      return;
    }

    try {
      setLoading(true);
      
      // Update password using Supabase auth (no current password required since user is authenticated via reset link)
      const result = await updatePassword(passwordData.newPassword);
      
      if (result.success) {
        setNotification({ show: true, message: 'Password updated successfully! Redirecting to login...', type: 'success' });
        setTimeout(() => {
          // Log out the user and redirect to login to ensure they use the new password
          supabase.auth.signOut().then(() => {
            navigate('/login');
          });
        }, 2000);
      } else {
        setNotification({ show: true, message: result.error || 'Failed to update password', type: 'danger' });
      }
    } catch (err) {
      setNotification({ show: true, message: err.message, type: 'danger' });
    } finally {
      setLoading(false);
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <FaLock className="text-4xl text-indigo-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset Your Password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your new password below
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {notification.show && (
            <div className={`mb-4 p-4 rounded-md ${
              notification.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {notification.message}
            </div>
          )}

          <form onSubmit={handlePasswordReset} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="mt-1 relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter new password (min 6 characters)"
                  minLength="6"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                >
                  {showPasswords.new ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="mt-1 relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                >
                  {showPasswords.confirm ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
