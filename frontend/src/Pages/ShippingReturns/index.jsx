import React from 'react';

const ShippingReturns = () => (
  <section className="container mx-auto px-4 py-8 max-w-3xl min-h-[60vh]">
    <div className="bg-white rounded-lg shadow-md p-6 md:p-10 mb-8">
      <h1 className="text-2xl font-bold mb-4">Shipping & Returns</h1>
      <h2 className="text-lg font-semibold mt-6 mb-2">Shipping Policy</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>Orders are processed within 1-2 business days.</li>
        <li>Delivery times vary by location (typically 3-7 days).</li>
        <li>Shipping charges are calculated at checkout.</li>
      </ul>
      <h2 className="text-lg font-semibold mt-6 mb-2">Return & Exchange Policy</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>Returns accepted within 7 days of delivery for unused items.</li>
        <li>Contact us at <a href="mailto:bigandbestmart@gmail.com" className="text-blue-500 underline">bigandbestmart@gmail.com</a> to initiate a return.</li>
        <li>Refunds are processed within 5 business days after receiving the returned item.</li>
      </ul>
    </div>
  </section>
);

export default ShippingReturns;
