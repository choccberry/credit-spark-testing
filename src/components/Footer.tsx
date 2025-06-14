import React from 'react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import AdSenseAd from './AdSenseAd';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* AdSense Ad */}
        <div className="mb-8">
          <AdSenseAd adType="footer" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Credit Spark Exchange</h3>
            <p className="text-muted-foreground text-sm mb-4">
              A revolutionary platform that democratizes digital advertising through our 
              innovative credit-based exchange system.
            </p>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Credit Spark Exchange. All rights reserved.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/view-ads" className="text-muted-foreground hover:text-foreground transition-colors">
                  View Ads
                </Link>
              </li>
              <li>
                <Link to="/create-campaign" className="text-muted-foreground hover:text-foreground transition-colors">
                  Create Campaign
                </Link>
              </li>
              <li>
                <Link to="/my-campaigns" className="text-muted-foreground hover:text-foreground transition-colors">
                  My Campaigns
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Made with ❤️ for advertisers and content creators worldwide
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;