import React from 'react';

const FAQ = () => (
  <section className="container mx-auto px-4 py-8 max-w-3xl min-h-[60vh]">
    <div className="bg-white rounded-lg shadow-md p-6 md:p-10 mb-8">
      <h1 className="text-2xl font-bold mb-4">Frequently Asked Questions</h1>
      <div className="mb-6">
        <h2 className="font-semibold mb-1">Q: How do I place an order?</h2>
        <p>A: Browse our products, add items to your cart, and proceed to checkout. Follow the instructions to complete your purchase.</p>
      </div>
      <div className="mb-6">
        <h2 className="font-semibold mb-1">Q: What payment methods are accepted?</h2>
        <p>A: We accept credit/debit cards, UPI, and net banking.</p>
      </div>
      <div className="mb-6">
        <h2 className="font-semibold mb-1">Q: How can I track my order?</h2>
        <p>A: You will receive an email with tracking details once your order is shipped.</p>
      </div>
      <div className="mb-6">
        <h2 className="font-semibold mb-1">Q: Can I return or exchange a product?</h2>
        <p>A: Yes, please see our Shipping & Returns page for details.</p>
      </div>
    </div>
  </section>
);

export default FAQ;
