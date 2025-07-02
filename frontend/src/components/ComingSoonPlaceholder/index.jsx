import React from 'react';
import { Link } from 'react-router-dom';

const ComingSoonPlaceholder = ({ 
  icon: Icon, 
  title, 
  description, 
  linkTo, 
  linkText = "Learn More" 
}) => {
  return (
    <div className="text-center py-12">
      <Icon className="text-6xl text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{description}</p>
      <Link
        to={linkTo}
        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
      >
        {linkText}
      </Link>
    </div>
  );
};

export default ComingSoonPlaceholder;
