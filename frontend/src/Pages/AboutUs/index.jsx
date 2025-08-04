import React from 'react';
import { useSettings } from '../../contexts/SettingsContext.jsx';

const AboutUs = () => {
  const { getSetting } = useSettings();
  
  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">About {getSetting('company_name', 'BBMart')}</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {getSetting('about_hero_text', 'Your one-stop destination for quality stationery and custom printing services.')}
          </p>
        </div>
        
        {/* Our Story Section */}
        <div className="flex flex-col md:flex-row items-center mb-16">
          <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
            <img 
              src={getSetting('about_image', '/about-image.jpg')} 
              alt="Our Store" 
              className="rounded-lg shadow-lg w-full h-auto"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/600x400?text=Our+Store";
              }}
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-2xl font-semibold mb-4">{getSetting('about_story_title', 'Our Story')}</h2>
            <p className="text-gray-700 mb-4">
              {getSetting('about_story_paragraph_1', 'Founded in 2015, BBMart started as a small stationery shop with a vision to provide high-quality products to students and professionals alike. Over the years, we\'ve grown into a comprehensive stationery and printing service provider.')}
            </p>
            <p className="text-gray-700 mb-4">
              {getSetting('about_story_paragraph_2', 'Our journey began with a simple idea: to make quality stationery accessible to everyone. Today, we pride ourselves on offering an extensive range of products and services that cater to diverse needs - from basic school supplies to custom printed merchandise.')}
            </p>
            <p className="text-gray-700">
              {getSetting('about_story_paragraph_3', 'What sets us apart is our commitment to quality, affordability, and customer satisfaction. Every product that leaves our store is carefully selected or crafted to ensure it meets our high standards.')}
            </p>
          </div>
        </div>
        
        {/* Our Mission & Values */}
        <div className="bg-gray-50 p-8 rounded-lg mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-center">{getSetting('about_mission_title', 'Our Mission & Values')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-medium mb-3">{getSetting('about_value_1_title', 'Quality First')}</h3>
              <p className="text-gray-700">
                {getSetting('about_value_1_text', 'We never compromise on the quality of our products. Each item is carefully sourced or crafted to ensure durability and performance.')}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-medium mb-3">{getSetting('about_value_2_title', 'Customer Satisfaction')}</h3>
              <p className="text-gray-700">
                {getSetting('about_value_2_text', 'Your satisfaction is our priority. We strive to provide exceptional service and address your needs promptly and efficiently.')}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-medium mb-3">{getSetting('about_value_3_title', 'Innovation')}</h3>
              <p className="text-gray-700">
                {getSetting('about_value_3_text', 'We continuously evolve our product range and services to incorporate the latest trends and technologies in stationery and printing.')}
              </p>
            </div>
          </div>
        </div>
        
        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-8 text-center">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { name: 'Vikash Jha', position: 'Founder & CEO', image: 'Vikas.jpg' },
    
              { name: 'Rudraksh Sharma', position: 'Web developer', image: 'Rudra.jpg' }
            ].map((member, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow text-center">
                <img 
                  src={`/${member.image}`} 
                  alt={member.name} 
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://placehold.co/300x300?text=${member.name.charAt(0)}`;
                  }} 
                />
                <h3 className="text-lg font-medium">{member.name}</h3>
                <p className="text-gray-600">{member.position}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Why Choose Us */}
        <div>
          <h2 className="text-2xl font-semibold mb-8 text-center">Why Choose {getSetting('company_name', 'BBMart')}?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <div className="bg-primary text-white p-3 rounded-lg mr-4" style={{ backgroundColor: '#3f51b5' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">{getSetting('about_feature_1_title', 'Extensive Product Range')}</h3>
                <p className="text-gray-700">
                  {getSetting('about_feature_1_text', 'From basic stationery to specialized art supplies, we offer a comprehensive selection to meet diverse needs.')}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-primary text-white p-3 rounded-lg mr-4" style={{ backgroundColor: '#3f51b5' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">{getSetting('about_feature_2_title', 'Custom Printing Services')}</h3>
                <p className="text-gray-700">
                  {getSetting('about_feature_2_text', 'Our state-of-the-art printing technology allows us to deliver high-quality customized products.')}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-primary text-white p-3 rounded-lg mr-4" style={{ backgroundColor: '#3f51b5' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">{getSetting('about_feature_3_title', 'Competitive Pricing')}</h3>
                <p className="text-gray-700">
                  {getSetting('about_feature_3_text', 'We offer the best value for your money with regular promotions and discounts.')}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-primary text-white p-3 rounded-lg mr-4" style={{ backgroundColor: '#3f51b5' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">{getSetting('about_feature_4_title', 'Fast & Reliable Delivery')}</h3>
                <p className="text-gray-700">
                  {getSetting('about_feature_4_text', 'Count on us for prompt delivery, with special options for urgent requirements.')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
