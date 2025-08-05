import React from "react";

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 py-16 px-4 flex items-center justify-center">
    <div className="relative max-w-3xl w-full bg-white rounded-2xl shadow-2xl p-10 border border-gray-100">
      {/* Logo (optional) */}
      <div className="flex justify-center mb-6">
        <img
          src="/logo.png"
          alt="BBMart Logo"
          className="h-14 w-14 object-contain rounded-full shadow"
          onError={e => (e.target.style.display = "none")}
        />
      </div>
      <h1 className="text-4xl font-extrabold mb-4 text-center text-primary" style={{ color: "#3f51b5" }}>
        Privacy Policy
      </h1>
      <p className="mb-6 text-center text-gray-500 text-sm">
        <strong>Last updated:</strong> August 5, 2025
      </p>
      <div className="divide-y divide-gray-200">
        <section className="pb-6">
          <p className="mb-4 text-gray-700 text-lg">
            <span className="font-semibold">BIG & BEST MART (OPC) PRIVATE LIMITED</span> is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website.
          </p>
        </section>
        <section className="py-6">
          <h2 className="text-2xl font-semibold mb-3 text-primary" style={{ color: "#3f51b5" }}>Information We Collect</h2>
          <ul className="list-disc pl-6 mb-2 text-gray-700 space-y-1">
            <li>Personal identification information (Name, email address, phone number, etc.)</li>
            <li>Order and payment information</li>
            <li>Usage data and cookies</li>
          </ul>
        </section>
        <section className="py-6">
          <h2 className="text-2xl font-semibold mb-3 text-primary" style={{ color: "#3f51b5" }}>How We Use Your Information</h2>
          <ul className="list-disc pl-6 mb-2 text-gray-700 space-y-1">
            <li>To process orders and manage your account</li>
            <li>To improve our website and services</li>
            <li>To communicate with you about updates and offers</li>
          </ul>
        </section>
        <section className="py-6">
          <h2 className="text-2xl font-semibold mb-3 text-primary" style={{ color: "#3f51b5" }}>Your Rights</h2>
          <p className="mb-2 text-gray-700">
            You have the right to access, update, or delete your personal information. Contact us at{" "}
            <a href="mailto:bigandbestmart@gmail.com" className="text-blue-600 underline hover:text-blue-800 transition">
              bigandbestmart@gmail.com
            </a>{" "}
            for any privacy-related requests.
          </p>
        </section>
        <section className="pt-6">
          <h2 className="text-2xl font-semibold mb-3 text-primary" style={{ color: "#3f51b5" }}>Contact Us</h2>
          <p className="text-gray-700">
            If you have any questions about this Privacy Policy, please contact us at{" "}
            <a href="mailto:bigandbestmart@gmail.com" className="text-blue-600 underline hover:text-blue-800 transition">
              bigandbestmart@gmail.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  </div>
);

export default PrivacyPolicy;