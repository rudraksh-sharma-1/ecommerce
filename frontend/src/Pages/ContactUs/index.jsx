import React from 'react';

const ContactUs = () => {
  return (
    <div className="bg-gray-50 py-16 min-h-[70vh] md:mt-0 mt-[-2.7rem]">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions or need help? Reach out to us using the details below. Our team will be happy to assist you.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-8 justify-center items-start">
          {/* Contact Information */}
          <div className="w-full md:w-1/2 lg:w-2/5">
            <div className="bg-white p-8 rounded-lg shadow-md h-full">
              <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Address</h3>
                <p className="text-gray-700">
                  37/1, central Road, K B Sarani, Uttapara,<br />
                  Madhyamgram, North 24 Parganas,<br />
                  Barasat - Ii, West Bengal, India, 700129
                </p>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Phone</h3>
                <a href="tel:+917059911480" className="text-blue-600 hover:underline text-base">
                  +91 7059911480
                </a>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Email</h3>
                <a href="mailto:bigandbestmart@gmail.com" className="text-blue-600 hover:underline text-base">
                  bigandbestmart@gmail.com
                </a>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Business Hours</h3>
                <p className="text-gray-700">
                  Monday - Friday: 9:00 AM - 6:00 PM<br />
                  Saturday: 10:00 AM - 4:00 PM<br />
                  Sunday: Closed
                </p>
              </div>
            </div>
          </div>
          {/* Google Maps Embed */}
          <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col items-center">
            <div className="bg-white p-4 rounded-lg shadow-md w-full">
              <h2 className="text-xl font-semibold mb-4 text-center">Our Location</h2>
              <a
                href="https://maps.google.com/?q=22.7035140,88.4672730"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View on Google Maps"
                className="block hover:opacity-90"
              >
                <iframe
                  title="BBMart Location Map"
                  width="100%"
                  height="220"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src="https://www.google.com/maps?q=22.7035140,88.4672730&z=16&output=embed"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-md"
                ></iframe>
                <div className="text-xs text-blue-400 text-center mt-2 underline">View on Google Maps</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
