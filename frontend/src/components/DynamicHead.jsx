import { useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext.jsx';

const DynamicHead = () => {
  const { getSetting } = useSettings();

  useEffect(() => {
    // Update document title
    const title = getSetting('site_title', 'Big & best Mart');
    document.title = title;

    // Update meta description
    const description = getSetting('site_description', 'Your one-stop shop for quality products');
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = description;

    // Update meta keywords
    const keywords = getSetting('site_keywords', 'e-commerce, shopping, products');
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = keywords;

    // Update favicon if provided
    const favicon = getSetting('site_favicon');
    if (favicon) {
      let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = favicon;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }, [getSetting]);

  return null; // This component doesn't render anything
};

export default DynamicHead;
