import React from 'react';
import { usePromotional } from '../../contexts/PromotionalContext';
import { FaBolt, FaClock } from 'react-icons/fa';
import './style.css';

const FlashSale = ({ className = '', showIcon = true }) => {
  const { getPromoSetting } = usePromotional();

  const isActive = getPromoSetting('flash_sale_active', 'false') === 'true';
  const flashSaleText = getPromoSetting('flash_sale_text', '');
  const flashSaleDiscount = getPromoSetting('flash_sale_discount', '');

  // Don't render if not active or no text
  if (!isActive || !flashSaleText) {
    return null;
  }

  return (
    <div className={`flash-sale-banner ${className}`}>
      <div className="flash-sale-content">
        {showIcon && (
          <div className="flash-sale-icon">
            <FaBolt className="flash-icon" />
          </div>
        )}
        
        <div className="flash-sale-text">
          <span className="flash-sale-label">{flashSaleText}</span>
          {flashSaleDiscount && (
            <span className="flash-sale-discount">{flashSaleDiscount}</span>
          )}
        </div>
        
        <div className="flash-sale-timer">
          <FaClock className="timer-icon" />
          <span>Limited Time!</span>
        </div>
      </div>
    </div>
  );
};

export default FlashSale;
