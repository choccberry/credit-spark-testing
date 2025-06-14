import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';

// Store AdSense settings in localStorage for now
const getAdSenseSettings = () => {
  const settings = localStorage.getItem('adsense_settings');
  return settings ? JSON.parse(settings) : {
    publisherId: '',
    headerCode: '',
    sidebarCode: '',
    footerCode: '',
    viewAdsCode: ''
  };
};

const saveAdSenseSettings = (settings: any) => {
  localStorage.setItem('adsense_settings', JSON.stringify(settings));
};

const AdSenseSettings = () => {
  const { authState } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState(getAdSenseSettings());
  const [isLoading, setIsLoading] = useState(false);

  if (!authState.isAuthenticated || authState.user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      saveAdSenseSettings(settings);
      
      toast({
        title: 'AdSense settings saved',
        description: 'Your AdSense configuration has been updated successfully.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin Panel
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">AdSense Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Configure Google AdSense</CardTitle>
            <p className="text-muted-foreground">
              Set up your AdSense codes to monetize your platform. These ads will be displayed across the site.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="publisherId">AdSense Publisher ID</Label>
                <Input
                  id="publisherId"
                  type="text"
                  value={settings.publisherId}
                  onChange={(e) => updateSetting('publisherId', e.target.value)}
                  placeholder="ca-pub-xxxxxxxxxxxxxxxxx"
                />
                <p className="text-sm text-muted-foreground">
                  Your Google AdSense Publisher ID (found in your AdSense account)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="headerCode">Header Ad Code</Label>
                <Textarea
                  id="headerCode"
                  value={settings.headerCode}
                  onChange={(e) => updateSetting('headerCode', e.target.value)}
                  placeholder="<script async src=&quot;https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js&quot;>...</script>"
                  rows={4}
                />
                <p className="text-sm text-muted-foreground">
                  Ad code to display in the header area of pages
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sidebarCode">Sidebar Ad Code</Label>
                <Textarea
                  id="sidebarCode"
                  value={settings.sidebarCode}
                  onChange={(e) => updateSetting('sidebarCode', e.target.value)}
                  placeholder="<ins class=&quot;adsbygoogle&quot; style=&quot;display:block&quot;>...</ins>"
                  rows={4}
                />
                <p className="text-sm text-muted-foreground">
                  Ad code for sidebar placements (dashboard, campaign pages)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="viewAdsCode">View Ads Page Ad Code</Label>
                <Textarea
                  id="viewAdsCode"
                  value={settings.viewAdsCode}
                  onChange={(e) => updateSetting('viewAdsCode', e.target.value)}
                  placeholder="<ins class=&quot;adsbygoogle&quot; style=&quot;display:block&quot;>...</ins>"
                  rows={4}
                />
                <p className="text-sm text-muted-foreground">
                  Ad code to display on the ad viewing page (your revenue source)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="footerCode">Footer Ad Code</Label>
                <Textarea
                  id="footerCode"
                  value={settings.footerCode}
                  onChange={(e) => updateSetting('footerCode', e.target.value)}
                  placeholder="<ins class=&quot;adsbygoogle&quot; style=&quot;display:block&quot;>...</ins>"
                  rows={4}
                />
                <p className="text-sm text-muted-foreground">
                  Ad code for footer area across all pages
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Important Notes:</h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• Make sure your AdSense account is approved for your domain</li>
                  <li>• Test ads in a staging environment before going live</li>
                  <li>• Follow AdSense policies to avoid account suspension</li>
                  <li>• Monitor ad performance in your AdSense dashboard</li>
                </ul>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save AdSense Settings'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdSenseSettings;