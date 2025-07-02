import React, { useState, useEffect } from 'react';
import { getPromotionalSettings, updateMultiplePromotionalSettings } from '../utils/supabaseApi';
import { useMantineColorScheme } from '@mantine/core';

const PromotionalSettings = () => {
  const { colorScheme } = useMantineColorScheme();
  const [settings, setSettings] = useState({
    promo_shipping_title: '',
    promo_shipping_amount: '',
    promo_shipping_description: '',
    flash_sale_active: 'false',
    flash_sale_discount: '',
    flash_sale_text: '',
    announcement_bar_active: 'false',
    announcement_bar_color: '#ff4444',
    announcement_bar_text: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { success, settings: promoSettings } = await getPromotionalSettings();
      if (success) {
        setSettings(prev => ({
          ...prev,
          ...promoSettings
        }));
      }
    } catch (error) {
      // Settings loading failed
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      const { success } = await updateMultiplePromotionalSettings(settings);
      if (success) {
        setMessage('Promotions updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error updating settings. Please try again.');
      }
    } catch (error) {
      setMessage('Error updating settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg shadow-md p-6 ${colorScheme === 'dark' ? 'bg-[#18181b]' : 'bg-white'}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-semibold ${colorScheme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Promotions</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      {message && (
        <div className={`mb-4 p-3 rounded-md ${message.includes('Error') ? (colorScheme === 'dark' ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700') : (colorScheme === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700')}`}>
          {message}
        </div>
      )}
      <div className="space-y-6">
        {/* Free Shipping Banner Settings */}
        <div className={`border-b pb-6 ${colorScheme === 'dark' ? 'border-gray-700' : ''}`}> 
          <h2 className={`text-lg font-medium mb-4 ${colorScheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Free Shipping Banner</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Shipping Banner Title</label>
              <input
                type="text"
                value={settings.promo_shipping_title || ''}
                onChange={(e) => handleInputChange('promo_shipping_title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${colorScheme === 'dark' ? 'bg-[#23232b] border-gray-700 text-gray-100' : 'border-gray-300'}`}
                placeholder="Free Shipping"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Shipping Amount Text</label>
              <input
                type="text"
                value={settings.promo_shipping_amount || ''}
                onChange={(e) => handleInputChange('promo_shipping_amount', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${colorScheme === 'dark' ? 'bg-[#23232b] border-gray-700 text-gray-100' : 'border-gray-300'}`}
                placeholder="Only ₹500/-"
              />
            </div>
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Shipping Description</label>
              <textarea
                value={settings.promo_shipping_description || ''}
                onChange={(e) => handleInputChange('promo_shipping_description', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${colorScheme === 'dark' ? 'bg-[#23232b] border-gray-700 text-gray-100' : 'border-gray-300'}`}
                rows="2"
                placeholder="Free delivery on your first order and over ₹500"
              />
            </div>
          </div>
        </div>

        {/* Flash Sale Settings */}
        <div className={`border-b pb-6 ${colorScheme === 'dark' ? 'border-gray-700' : ''}`}> 
          <h2 className={`text-lg font-medium mb-4 ${colorScheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Flash Sale</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Enable Flash Sale</label>
              <select
                value={settings.flash_sale_active || 'false'}
                onChange={(e) => handleInputChange('flash_sale_active', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${colorScheme === 'dark' ? 'bg-[#23232b] border-gray-700 text-gray-100' : 'border-gray-300'}`}
              >
                <option value="false">Disabled</option>
                <option value="true">Enabled</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Flash Sale Discount</label>
              <input
                type="text"
                value={settings.flash_sale_discount || ''}
                onChange={(e) => handleInputChange('flash_sale_discount', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${colorScheme === 'dark' ? 'bg-[#23232b] border-gray-700 text-gray-100' : 'border-gray-300'}`}
                placeholder="30% OFF"
              />
            </div>
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Flash Sale Text</label>
              <input
                type="text"
                value={settings.flash_sale_text || ''}
                onChange={(e) => handleInputChange('flash_sale_text', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${colorScheme === 'dark' ? 'bg-[#23232b] border-gray-700 text-gray-100' : 'border-gray-300'}`}
                placeholder="Flash Sale: 24 Hours Only!"
              />
            </div>
          </div>
        </div>

        {/* Announcement Bar */}
        <div className={`border-b pb-6 ${colorScheme === 'dark' ? 'border-gray-700' : ''}`}> 
          <h2 className={`text-lg font-medium mb-4 ${colorScheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Announcement Bar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Show Announcement Bar</label>
              <select
                value={settings.announcement_bar_active || 'false'}
                onChange={(e) => handleInputChange('announcement_bar_active', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${colorScheme === 'dark' ? 'bg-[#23232b] border-gray-700 text-gray-100' : 'border-gray-300'}`}
              >
                <option value="false">Hidden</option>
                <option value="true">Visible</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Bar Color</label>
              <input
                type="color"
                value={settings.announcement_bar_color || '#ff4444'}
                onChange={(e) => handleInputChange('announcement_bar_color', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Announcement Text</label>
              <input
                type="text"
                value={settings.announcement_bar_text || ''}
                onChange={(e) => handleInputChange('announcement_bar_text', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${colorScheme === 'dark' ? 'bg-[#23232b] border-gray-700 text-gray-100' : 'border-gray-300'}`}
                placeholder="Free shipping on all orders this weekend!"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionalSettings;
