/* import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MdClose } from 'react-icons/md';
import { FaChevronDown } from 'react-icons/fa';
import Search from '../Search';
import './style.css'; */

const MobileMenu = ({ isOpen, onClose, includeSearch = false }) => {
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const toggleSubmenu = (menuName) => {
    setOpenSubmenu(openSubmenu === menuName ? null : menuName);
  };
  
  // Prevent body scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
    
    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, [isOpen]);

  return (
    <div className={`mobile-menu-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="mobile-menu-container" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-menu-header">
          <button className="close-menu-btn" onClick={onClose} aria-label="Close menu">
            <MdClose size={24} />
          </button>
          <h2>Menu</h2>
        </div>

        <div className="mobile-menu-content">
          {/* Search Bar for Mobile */}
          {includeSearch && (
            <div className="mobile-menu-search p-3 border-b border-gray-200">
              <Search />
            </div>
          )}
          
          <ul className="mobile-nav-list">
            <li>
              <Link to="/" onClick={onClose}>Home</Link>
            </li>
            
            <li className="has-submenu">
              <div 
                className="submenu-trigger"
                onClick={() => toggleSubmenu('stationery')}
              >
                <span>Stationery</span>
                <FaChevronDown className={`submenu-icon ${openSubmenu === 'stationery' ? 'rotated' : ''}`} />
              </div>
              
              <ul className={`mobile-submenu ${openSubmenu === 'stationery' ? 'open' : ''}`}>
                <li>
                  <Link to="/productListing?category=notebooks" onClick={onClose}>Notebooks</Link>
                </li>
                <li>
                  <Link to="/productListing?category=pens" onClick={onClose}>Pens</Link>
                </li>
                <li>
                  <Link to="/productListing?category=markers" onClick={onClose}>Markers</Link>
                </li>
                <li>
                  <Link to="/productListing?category=organizers" onClick={onClose}>Organizers</Link>
                </li>
                <li>
                  <Link to="/productListing?category=accessories" onClick={onClose}>Accessories</Link>
                </li>
              </ul>
            </li>
            
            {/* <li>
              <Link to="/custom-printing" onClick={onClose}>Custom Printing</Link>
            </li>
             */}
            {/* <li>
              <Link to="/blog" onClick={onClose}>Blog</Link>
            </li>
             */}
            {/* <li>
              <Link to="#" onClick={onClose}>Bussiness Partners</Link>
            </li> */}
            <li>
              <Link to="/about-us" onClick={onClose}>About Us</Link>
            </li>
            
            <li>
              <Link to="/contact-us" onClick={onClose}>Contact Us</Link>
            </li>
            
            <li>
              <Link to="/cart" onClick={onClose}>Cart</Link>
            </li>
          </ul>
          
          <div className="mobile-menu-account">
            <Link to="/login" className="mobile-account-link" onClick={onClose}>Login</Link>
            <Link to="/signup" className="mobile-account-link" onClick={onClose}>Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
