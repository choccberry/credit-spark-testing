
import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/SupabaseAuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Plus, List, LogOut, Coins, Shield, MessageCircle } from 'lucide-react';

const Dashboard = () => {
  const { authState, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  if (!authState.isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!authState.user) {
        setCheckingAdmin(false);
        return;
      }
      
      try {
        const { data, error } = await supabase.rpc('has_role', {
          _user_id: authState.user.id,
          _role: 'admin'
        });

        if (error) {
          console.error('Error checking admin role:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data || false);
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminRole();
  }, [authState.user]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Ad Exchange Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">{authState.profile?.credits || 0} Credits</span>
            </div>
            <Button variant="outline" onClick={signOut} size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {authState.profile?.display_name || authState.profile?.username || authState.user?.email}!</h2>
          <p className="text-muted-foreground">
            Manage your ad campaigns and earn credits by viewing ads.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-500" />
                View Ads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Watch ads and earn 5 credits for each completed view.
              </p>
              <Button asChild className="w-full">
                <Link to="/view-ads">Start Viewing Ads</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-500" />
                Create Campaign
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Create new ad campaigns to promote your products or services.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/create-campaign">Create New Campaign</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5 text-purple-500" />
                My Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                View and manage all your existing ad campaigns.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/my-campaigns">View My Campaigns</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-orange-500" />
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Chat with advertisers and interested users.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/messages">View Messages</Link>
              </Button>
            </CardContent>
          </Card>

          {!checkingAdmin && isAdmin && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-500" />
                  Admin Panel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Review and approve pending ad campaigns.
                </p>
                <Button asChild variant="destructive" className="w-full">
                  <Link to="/admin">Access Admin Panel</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{authState.profile?.credits || 0}</div>
                <div className="text-sm text-muted-foreground">Available Credits</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">5</div>
                <div className="text-sm text-muted-foreground">Credits per Ad View</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600">30s</div>
                <div className="text-sm text-muted-foreground">Viewing Time Required</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
