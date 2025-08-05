import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaPinterestP, FaYoutube } from 'react-icons/fa';
import { MdOutlineEmail, MdOutlineLocationOn, MdOutlinePhone } from 'react-icons/md';
import './style.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-gray-300 absolute w-full">
      <div className="container px-4 py-12 mx-auto">
        {/* Footer top section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* About section */}
          <div className="footer-column">
            <div className="mb-0 mt-2">
              <Link to="/" className="inline-block">
                <img 
                  src="/logo.png" 
                  alt="BBMart Logo" 
                  className="max-w-[150px] h-auto invert-[80%]"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/200x60?text=BBMart';
                  }}
                />
              </Link>
            </div>
            <p className="text-sm mb-2 text-gray-400">
              BBMart offers high-quality stationery and office supplies for professionals, 
              students, and businesses. We provide premium products that inspire creativity 
              and productivity.
            </p>
            <div className="social-icons flex space-x-3">
              <a href="https://www.facebook.com/share/16iZ1wvpYd/" className="social-icon" aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a href="#" className="social-icon" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="#" className="social-icon" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="#" className="social-icon" aria-label="Youtube">
                <FaYoutube />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="footer-column">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              <li>
                <Link to="/about-us" className="footer-link">About Us</Link>
              </li>
              <li>
                <Link to="/contact-us" className="footer-link">Contact Us</Link>
              </li>
              <li>
                <Link to="/faq" className="footer-link">FAQ</Link>
              </li>
              <li>
                <Link to="/shipping-returns" className="footer-link">Shipping & Returns</Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="footer-link">Privacy Policy</Link>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div className="footer-column">
            <h3 className="footer-title">Contact Us</h3>
            <ul className="footer-contact">
              <li className="flex items-start mb-2">
                <div className="flex-shrink-0 mt-1">
                  <MdOutlineLocationOn className="text-lg text-gray-400 mr-3" />
                </div>
                <p className="text-sm text-gray-400">
                  37/1,central Road, K B Sarani, Uttapara, Madhyamgram, North 24 Parganas, Barasat - Ii, West Bengal, India, 700129
                </p>
              </li>
              <li className="flex items-center mb-2">
                <MdOutlinePhone className="text-lg text-gray-400 mr-3" />
                <a href="tel:+1234567890" className="text-sm text-gray-400 hover:text-white transition-colors">
                  +91 7059911480 
                </a>
              </li>
              <li className="flex items-center mb-3">
                <MdOutlineEmail className="text-lg text-gray-400 mr-3" />
                <a href="mailto:info@bbmart.com" className="text-sm text-gray-400 hover:text-white transition-colors">
                  bigandbestmart@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Map column */}
          <div className="footer-column mt-4">
            
            <div className="rounded-lg overflow-hidden shadow-md border border-gray-700 bg-gray-900">
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
                  height="150"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src="https://www.google.com/maps?q=22.7035140,88.4672730&z=16&output=embed"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
                <div className="text-xs text-blue-400 text-center mt-2 underline">View on Google Maps</div>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-4 mb-2 pt-0 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400 mb-2 md:mb-0">
              &copy; {currentYear} BBMart. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/privacy-policy" className="text-xs text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="text-xs text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>

            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
