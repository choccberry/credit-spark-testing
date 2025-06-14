import React, { useEffect } from 'react';

interface AdSenseAdProps {
  adType: 'header' | 'sidebar' | 'footer' | 'viewAds';
  className?: string;
}

const AdSenseAd: React.FC<AdSenseAdProps> = ({ adType, className = '' }) => {
  useEffect(() => {
    // Load AdSense script if not already loaded
    if (!(window as any).adsbygoogle) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      document.head.appendChild(script);
    }
  }, []);

  const getAdSenseSettings = () => {
    const settings = localStorage.getItem('adsense_settings');
    return settings ? JSON.parse(settings) : null;
  };

  const settings = getAdSenseSettings();
  
  if (!settings) {
    return null;
  }

  const getAdCode = () => {
    switch (adType) {
      case 'header':
        return settings.headerCode;
      case 'sidebar':
        return settings.sidebarCode;
      case 'footer':
        return settings.footerCode;
      case 'viewAds':
        return settings.viewAdsCode;
      default:
        return '';
    }
  };

  const adCode = getAdCode();
  
  if (!adCode) {
    return null;
  }

  return (
    <div 
      className={`adsense-container ${className}`}
      dangerouslySetInnerHTML={{ __html: adCode }}
    />
  );
};

export default AdSenseAd;