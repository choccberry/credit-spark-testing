import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/SupabaseAuthProvider';
import { useCountryData } from '@/hooks/useCountryData';
import GlobalHeader from '@/components/GlobalHeader';
import DeleteAccountDialog from '@/components/DeleteAccountDialog';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';
import { ArrowLeft, User, Mail, MapPin, Calendar, Globe, Store, Coins } from 'lucide-react';

const Profile = () => {
  const { authState } = useAuth();
  const { userCountry } = useCountryData();

  if (!authState.isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  const profile = authState.profile;

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader />
      
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Profile</h1>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Coins className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">{profile?.credits || 0} Credits</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="display_name">Display Name</Label>
                    <Input
                      id="display_name"
                      value={profile?.display_name || ''}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={profile?.username || ''}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile?.email || authState.user?.email || ''}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile?.bio || 'No bio added yet'}
                    readOnly
                    className="bg-muted min-h-20"
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profile?.location || 'Not specified'}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <ProfilePictureUpload 
                  currentAvatarUrl={profile?.avatar_url}
                  size="lg"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Shop Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <Store className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Shop feature coming soon</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      You'll be able to create and manage your online shop here
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Account Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Country:</span>
                  <span>{userCountry?.name || 'Not selected'}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">Credits:</span>
                  <span>{profile?.credits || 0}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Member since:</span>
                  <span>
                    {profile?.created_at 
                      ? new Date(profile.created_at).toLocaleDateString()
                      : 'Unknown'
                    }
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">User ID:</span>
                  <span className="text-xs font-mono">{profile?.user_id?.slice(0, 8)}...</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <DeleteAccountDialog />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;