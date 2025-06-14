import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-4xl mx-auto px-4">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Credit Spark Exchange
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Watch ads to earn credits, then use those credits to promote your own business. 
            Join thousands of users in our fair and transparent advertising ecosystem.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 bg-card rounded-lg border">
              <div className="text-4xl mb-4">👀</div>
              <h3 className="text-lg font-semibold mb-2">Watch Ads</h3>
              <p className="text-muted-foreground text-sm">
                View ads for 30 seconds and earn 5 credits each time
              </p>
            </div>
            <div className="p-6 bg-card rounded-lg border">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-lg font-semibold mb-2">Earn Credits</h3>
              <p className="text-muted-foreground text-sm">
                Build up your credit balance to fund your own campaigns
              </p>
            </div>
            <div className="p-6 bg-card rounded-lg border">
              <div className="text-4xl mb-4">📢</div>
              <h3 className="text-lg font-semibold mb-2">Advertise</h3>
              <p className="text-muted-foreground text-sm">
                Create campaigns to promote your products and services
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/register"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
            >
              Get Started - 100 Free Credits
            </a>
            <a 
              href="/login"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
            >
              Login
            </a>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;