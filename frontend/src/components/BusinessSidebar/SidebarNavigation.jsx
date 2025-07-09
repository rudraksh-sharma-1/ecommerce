import React, { useState } from "react";
import VendorRegistrationForm from "../BusinessComponents/VendorRegistrationForm.jsx";
// Dummy placeholders — replace with real forms
const BulkOrderEnquiry = () => <div>Bulk Order Enquiry (WhatsApp)</div>;
const FranchisePartnerForm = () => <div>Franchise/Distributor Partner Form</div>;
const EPartnerForm = () => <div>E-Partner Form</div>;

const NavigationPage = () => {
  const [activeTab, setActiveTab] = useState("vendor");

  const renderContent = () => {
    switch (activeTab) {
      case "vendor":
        return <VendorRegistrationForm />;
      case "bulk":
        return <BulkOrderEnquiry />;
      case "franchise":
        return <FranchisePartnerForm />;
      case "epartner":
        return <EPartnerForm />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile - Horizontal Tabs */}
      <div className="md:hidden bg-gray-100 border-b border-gray-300 flex overflow-x-auto">
        {[
          { label: "Vendor", value: "vendor" },
          { label: "Bulk Order", value: "bulk" },
          { label: "Franchise", value: "franchise" },
          { label: "E-Partner", value: "epartner" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors focus:outline-none ${
              activeTab === tab.value
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500, hover:text-gray-700, hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Desktop - Sidebar */}
      <div className="hidden md:block w-64 bg-gray-100 border-r border-gray-300 p-4">
        <h2 className="text-lg font-semibold mb-4">Business Options</h2>
        <ul className="space-y-2">
          <li>
            <button
              className={`w-full text-left px-4 py-2 rounded ${
                activeTab === "vendor"
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200 text-gray-700"
              }`}
              onClick={() => setActiveTab("vendor")}
            >
              Vendor Registration
            </button>
          </li>
          <li>
            <button
              className={`w-full text-left px-4 py-2 rounded ${
                activeTab === "bulk"
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200 text-gray-700"
              }`}
              onClick={() => setActiveTab("bulk")}
            >
              Bulk Order Enquiry
            </button>
          </li>
          <li>
            <button
              className={`w-full text-left px-4 py-2 rounded ${
                activeTab === "franchise"
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200 text-gray-700"
              }`}
              onClick={() => setActiveTab("franchise")}
            >
              Franchise/Distributor Partner
            </button>
          </li>
          <li>
            <button
              className={`w-full text-left px-4 py-2 rounded ${
                activeTab === "epartner"
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200 text-gray-700"
              }`}
              onClick={() => setActiveTab("epartner")}
            >
              E-Partner
            </button>
          </li>
        </ul>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 bg-white text-center">{renderContent()}</div>
    </div>
  );
};

export default NavigationPage;
