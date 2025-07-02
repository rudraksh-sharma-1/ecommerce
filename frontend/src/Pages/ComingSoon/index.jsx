import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaCog, FaShoppingBag, FaWallet } from 'react-icons/fa';

const ComingSoon = () => {
  const [searchParams] = useSearchParams();
  const feature = searchParams.get('feature');

  const getFeatureInfo = () => {
    switch (feature) {
      case 'orders':
        return {
          title: 'My Orders',
          icon: <FaShoppingBag className="w-16 h-16 text-blue-500 mx-auto mb-4" />,
          description: 'Track your orders, view order history, and manage returns and exchanges.',
          features: [
            'Order tracking with real-time updates',
            'Order history and receipts',
            'Easy returns and exchanges',
            'Delivery status notifications'
          ]
        };
      case 'wallet':
        return {
          title: 'Wallet',
          icon: <FaWallet className="w-16 h-16 text-green-500 mx-auto mb-4" />,
          description: 'Manage your digital wallet, add funds, and make secure payments.',
          features: [
            'Add money to your wallet',
            'Quick and secure payments',
            'Transaction history',
            'Cashback and rewards'
          ]
        };
      default:
        return {
          title: 'New Feature',
          icon: <FaCog className="w-16 h-16 text-gray-500 mx-auto mb-4" />,
          description: 'This exciting new feature is currently under development.',
          features: [
            'Enhanced user experience',
            'Advanced functionality',
            'Seamless integration',
            'Regular updates'
          ]
        };
    }
  };

  const featureInfo = getFeatureInfo();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Coming Soon Content */}
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
            {featureInfo.icon}
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {featureInfo.title}
            </h1>
            
            <h2 className="text-2xl font-semibold text-blue-600 mb-6">
              Coming Soon!
            </h2>
            
            <p className="text-lg text-gray-600 mb-8">
              {featureInfo.description}
            </p>

            {/* Feature List */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                What to expect:
              </h3>
              <ul className="text-left space-y-3">
                {featureInfo.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Call to Action */}
            <div className="space-y-4">
              <p className="text-gray-600">
                We're working hard to bring you this feature. Stay tuned for updates!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Continue Shopping
                </Link>
                
                <Link
                  to="/contactUs"
                  className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span className="ml-2">Development in progress...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
