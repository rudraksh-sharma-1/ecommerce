import React from "react";

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 py-12 px-4">
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-3xl font-bold mb-6 text-primary" style={{ color: "#3f51b5" }}>
        Privacy Policy
      </h1>
      <p className="mb-4 text-gray-700">
        <strong>Last updated:</strong> August 5, 2025
      </p>
      <p className="mb-4 text-gray-700">
        BBMart (“we”, “us”, or “our”) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2 text-primary" style={{ color: "#3f51b5" }}>Information We Collect</h2>
      <ul className="list-disc pl-6 mb-4 text-gray-700">
        <li>Personal identification information (Name, email address, phone number, etc.)</li>
        <li>Order and payment information</li>
        <li>Usage data and cookies</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2 text-primary" style={{ color: "#3f51b5" }}>How We Use Your Information</h2>
      <ul className="list-disc pl-6 mb-4 text-gray-700">
        <li>To process orders and manage your account</li>
        <li>To improve our website and services</li>
        <li>To communicate with you about updates and offers</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2 text-primary" style={{ color: "#3f51b5" }}>Your Rights</h2>
      <p className="mb-4 text-gray-700">
        You have the right to access, update, or delete your personal information. Contact us at <a href="mailto:bigandbestmart@gmail.com" className="text-blue-600 underline">bigandbestmart@gmail.com</a> for any privacy-related requests.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2 text-primary" style={{ color: "#3f51b5" }}>Contact Us</h2>
      <p className="mb-2 text-gray-700">
        If you have any questions about this Privacy Policy, please contact us at <a href="mailto:bigandbestmart@gmail.com" className="text-blue-600 underline">bigandbestmart@gmail.com</a>.
      </p>
    </div>
  </div>
);

export default PrivacyPolicy;