import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Button variant="outline" size="sm" asChild className="mb-4">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 prose prose-gray dark:prose-invert">
        <h2>Information We Collect</h2>
        <p>
          We collect information you provide directly to us, such as when you create an account, 
          participate in our advertising exchange, or contact us for support.
        </p>

        <h3>Personal Information</h3>
        <ul>
          <li>Name and email address</li>
          <li>Account credentials</li>
          <li>Payment information for credit transactions</li>
          <li>Advertising campaign data</li>
        </ul>

        <h3>Automatically Collected Information</h3>
        <ul>
          <li>Device information and IP address</li>
          <li>Browser type and version</li>
          <li>Usage patterns and interactions with ads</li>
          <li>Cookies and similar tracking technologies</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide and maintain our advertising exchange service</li>
          <li>Process credit transactions and manage your account</li>
          <li>Improve our services and develop new features</li>
          <li>Communicate with you about your account and our services</li>
          <li>Comply with legal obligations</li>
        </ul>

        <h2>Information Sharing</h2>
        <p>
          We do not sell, trade, or otherwise transfer your personal information to third parties 
          without your consent, except as described in this policy.
        </p>

        <h3>We May Share Information With:</h3>
        <ul>
          <li>Service providers who assist in operating our platform</li>
          <li>Advertisers (only aggregated, non-personal data)</li>
          <li>Law enforcement when required by law</li>
        </ul>

        <h2>Data Security</h2>
        <p>
          We implement appropriate security measures to protect your personal information against 
          unauthorized access, alteration, disclosure, or destruction.
        </p>

        <h2>Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access and update your personal information</li>
          <li>Request deletion of your data</li>
          <li>Opt out of certain communications</li>
          <li>Withdraw consent where applicable</li>
        </ul>

        <h2>Cookies</h2>
        <p>
          We use cookies to enhance your experience on our platform. You can control cookie 
          settings through your browser preferences.
        </p>

        <h2>Children's Privacy</h2>
        <p>
          Our service is not intended for children under 13. We do not knowingly collect 
          personal information from children under 13.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. We will notify you of any 
          changes by posting the new policy on this page.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about this privacy policy, please contact us at{' '}
          <Link to="/contact" className="text-primary hover:underline">
            our contact page
          </Link>.
        </p>
      </main>
    </div>
  );
};

export default PrivacyPolicy;