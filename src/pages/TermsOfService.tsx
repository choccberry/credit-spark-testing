import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const TermsOfService = () => {
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
          <h1 className="text-4xl font-bold">Terms of Service</h1>
          <p className="text-muted-foreground mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 prose prose-gray dark:prose-invert">
        <h2>Acceptance of Terms</h2>
        <p>
          By accessing and using Credit Spark Exchange, you accept and agree to be bound by the 
          terms and provision of this agreement.
        </p>

        <h2>Description of Service</h2>
        <p>
          Credit Spark Exchange is a platform that allows users to earn credits by viewing 
          advertisements and use those credits to run their own advertising campaigns.
        </p>

        <h2>User Accounts</h2>
        <h3>Account Creation</h3>
        <ul>
          <li>You must provide accurate and complete information</li>
          <li>You are responsible for maintaining account security</li>
          <li>One account per person is permitted</li>
          <li>You must be at least 18 years old to create an account</li>
        </ul>

        <h3>Account Responsibilities</h3>
        <ul>
          <li>Keep your login credentials secure</li>
          <li>Notify us immediately of any unauthorized use</li>
          <li>You are responsible for all activities under your account</li>
        </ul>

        <h2>Credit System</h2>
        <h3>Earning Credits</h3>
        <ul>
          <li>Credits are earned by viewing advertisements for the required duration</li>
          <li>Credits have no monetary value outside our platform</li>
          <li>Credits cannot be transferred between users</li>
        </ul>

        <h3>Using Credits</h3>
        <ul>
          <li>Credits can be used to create and run advertising campaigns</li>
          <li>Campaign costs are deducted from your credit balance</li>
          <li>Unused credits remain in your account indefinitely</li>
        </ul>

        <h2>Advertising Guidelines</h2>
        <h3>Prohibited Content</h3>
        <p>Advertisements must not contain:</p>
        <ul>
          <li>Illegal or harmful content</li>
          <li>Adult or explicit material</li>
          <li>Misleading or deceptive claims</li>
          <li>Hate speech or discriminatory content</li>
          <li>Malware or malicious code</li>
        </ul>

        <h3>Content Standards</h3>
        <ul>
          <li>All advertisements must comply with applicable laws</li>
          <li>Content must be appropriate for general audiences</li>
          <li>We reserve the right to review and reject any advertisement</li>
        </ul>

        <h2>Prohibited Activities</h2>
        <p>Users are prohibited from:</p>
        <ul>
          <li>Using automated scripts or bots</li>
          <li>Creating multiple accounts</li>
          <li>Manipulating the credit earning system</li>
          <li>Violating intellectual property rights</li>
          <li>Engaging in fraudulent activities</li>
        </ul>

        <h2>Service Availability</h2>
        <p>
          We strive to maintain service availability but do not guarantee uninterrupted access. 
          We may suspend service for maintenance or other operational reasons.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          Credit Spark Exchange shall not be liable for any indirect, incidental, special, 
          consequential, or punitive damages resulting from your use of the service.
        </p>

        <h2>Privacy</h2>
        <p>
          Your privacy is important to us. Please review our{' '}
          <Link to="/privacy-policy" className="text-primary hover:underline">
            Privacy Policy
          </Link>{' '}
          to understand how we collect and use your information.
        </p>

        <h2>Termination</h2>
        <p>
          We may terminate or suspend your account at any time for violation of these terms. 
          You may also terminate your account at any time.
        </p>

        <h2>Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. Changes will be effective 
          immediately upon posting. Continued use of the service constitutes acceptance of 
          modified terms.
        </p>

        <h2>Contact Information</h2>
        <p>
          For questions about these terms, please contact us at{' '}
          <Link to="/contact" className="text-primary hover:underline">
            our contact page
          </Link>.
        </p>
      </main>
    </div>
  );
};

export default TermsOfService;