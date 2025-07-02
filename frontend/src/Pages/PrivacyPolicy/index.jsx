import React from 'react';

const PrivacyPolicy = () => (
  <section className="container mx-auto px-4 py-8 max-w-3xl min-h-[60vh]">
    <div className="bg-white rounded-lg shadow-md p-6 md:p-10 mb-8">
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4">We value your privacy. BBMart collects only the information necessary to process your orders and provide a better shopping experience. We do not sell or share your personal data with third parties except as required to fulfill your order or by law.</p>
      <h2 className="text-lg font-semibold mt-6 mb-2">What We Collect</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>Name, address, and contact details</li>
        <li>Order and payment information</li>
        <li>Usage data for improving our services</li>
      </ul>
      <h2 className="text-lg font-semibold mt-6 mb-2">How We Use Your Data</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>To process and deliver your orders</li>
        <li>To communicate order updates</li>
        <li>To improve our website and services</li>
      </ul>
      <p>For any privacy concerns, contact us at <a href="mailto:bigandbestmart@gmail.com" className="text-blue-500 underline">bigandbestmart@gmail.com</a>.</p>
    </div>
  </section>
);

export default PrivacyPolicy;
