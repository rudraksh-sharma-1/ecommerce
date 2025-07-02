import React from 'react';
import { usePromotional } from '../../contexts/PromotionalContext';
import { FaTimes } from 'react-icons/fa';
import './style.css';

const AnnouncementBar = () => {
  const { getPromoSetting } = usePromotional();
  const [isVisible, setIsVisible] = React.useState(true);

  // Check if user previously closed it this session - must be called before any conditional returns
  React.useEffect(() => {
    const wasClosed = sessionStorage.getItem('announcement_bar_closed');
    if (wasClosed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const isActive = getPromoSetting('announcement_bar_active', 'false') === 'true';
  const announcementText = getPromoSetting('announcement_bar_text', '');
  const backgroundColor = getPromoSetting('announcement_bar_color', '#ff4444');

  // Calculate if the announcement bar should actually be shown
  const shouldShow = isActive && announcementText && isVisible;

  // Dispatch visibility change events to notify Header component
  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent('announcementBarVisibilityChange', { 
      detail: { visible: shouldShow } 
    }));
  }, [shouldShow]);

  // Don't render if not active, no text, or manually closed
  if (!shouldShow) {
    return null;
  }

  const handleClose = () => {
    setIsVisible(false);
    // Store in sessionStorage to keep it closed during the session
    sessionStorage.setItem('announcement_bar_closed', 'true');
  };

  return (
    <div 
      className="announcement-bar"
      style={{ backgroundColor }}
    >
      <div className="announcement-bar-content">
        <div className="announcement-text">
          {announcementText}
        </div>
        <button 
          className="announcement-close"
          onClick={handleClose}
          aria-label="Close announcement"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBar;
