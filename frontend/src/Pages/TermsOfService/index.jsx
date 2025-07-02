import React from 'react';

const TermsOfService = () => (
  <section className="container mx-auto px-4 py-8 max-w-3xl min-h-[60vh]">
    <div className="bg-white rounded-lg shadow-md p-6 md:p-10 mb-8">
      <h1 className="text-2xl font-bold mb-4">Terms of Service</h1>
      <p className="mb-4">By using BBMart, you agree to our terms and conditions. Please read them carefully before making a purchase.</p>
      <ul className="list-disc ml-6 mb-4">
        <li>All products are subject to availability.</li>
        <li>Prices and offers may change without notice.</li>
        <li>Orders may be cancelled if payment is not received.</li>
        <li>Use of our website is at your own risk.</li>
      </ul>
      <p>For questions, contact <a href="mailto:bigandbestmart@gmail.com" className="text-blue-500 underline">bigandbestmart@gmail.com</a>.</p>
    </div>
  </section>
);

export default TermsOfService;
