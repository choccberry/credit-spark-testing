import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, Target, Users, Coins, Shield } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Button variant="outline" size="sm" asChild className="mb-4">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">About Credit Spark Exchange</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A revolutionary platform that democratizes digital advertising through our 
              innovative credit-based exchange system.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Our Mission</h2>
            <p className="text-lg text-muted-foreground">
              We believe that effective advertising should be accessible to everyone, regardless 
              of budget size. Our platform creates a fair ecosystem where users can earn credits 
              by engaging with quality advertisements and use those credits to promote their own 
              businesses.
            </p>
            <p className="text-lg text-muted-foreground">
              By watching ads for just 30 seconds, users earn credits that can be immediately 
              used to run their own campaigns, creating a sustainable and equitable advertising 
              exchange.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md aspect-square bg-gradient-to-br from-primary/20 to-blue-600/20 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Target className="h-16 w-16 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold">Fair Exchange</h3>
                <p className="text-muted-foreground">Democratizing digital advertising</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="text-center">
              <Coins className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
              <CardTitle>Credit System</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                Earn 5 credits for every 30-second ad view. Use credits to fund your own campaigns.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-blue-500" />
              <CardTitle>Community Driven</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                Join thousands of users in our growing advertising community.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <CardTitle>Targeted Reach</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                Reach engaged audiences who are actively participating in our platform.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-purple-500" />
              <CardTitle>Safe & Secure</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                All ads are reviewed for quality and compliance with our content guidelines.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-card rounded-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Watch Ads</h3>
              <p className="text-muted-foreground">
                View advertisements for 30 seconds and earn 5 credits each time.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Accumulate Credits</h3>
              <p className="text-muted-foreground">
                Build up your credit balance to fund your own advertising campaigns.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Campaigns</h3>
              <p className="text-muted-foreground">
                Use your credits to promote your products and services to our community.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join our community and start earning credits today with 100 free credits to get you started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/register">
                Sign Up - 100 Free Credits
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/blog">
                Read Our Blog
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;