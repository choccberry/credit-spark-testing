import React from 'react';
import AdSenseAd from '@/components/AdSenseAd';

const BlogPostSidebar: React.FC = () => {
  return (
    <aside className="lg:col-span-1">
      <div className="sticky top-8 space-y-6">
        <AdSenseAd adType="sidebar" />
      </div>
    </aside>
  );
};

export default BlogPostSidebar;