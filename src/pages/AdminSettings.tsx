import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/SupabaseAuthProvider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Save, Upload, Globe, Settings, Image } from 'lucide-react';

interface AdminSettings {
  websiteIcon?: string;
  siteName?: string;
  siteDescription?: string;
  adsenseSettings?: {
    publisherId: string;
    headerCode: string;
    sidebarCode: string;
    footerCode: string;
    viewAdsCode: string;
  };
}

const AdminSettings = () => {
  const { authState } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<AdminSettings>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>('');

  if (!authState.isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    if (authState.user) {
      checkAdminRole();
    }
  }, [authState.user]);

  useEffect(() => {
    if (isAdmin) {
      loadSettings();
    }
  }, [isAdmin]);

  const checkAdminRole = async () => {
    if (!authState.user) return;
    
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: authState.user.id,
        _role: 'admin'
      });

      if (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(data || false);
    } catch (error) {
      console.error('Error checking admin role:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('key, value')
        .in('key', ['website_icon', 'site_name', 'site_description', 'adsense_settings']);

      if (error) {
        console.error('Error loading settings:', error);
        return;
      }

      const settingsObj: AdminSettings = {};
      data.forEach(item => {
        if (item.key === 'website_icon') settingsObj.websiteIcon = item.value as string;
        if (item.key === 'site_name') settingsObj.siteName = item.value as string;
        if (item.key === 'site_description') settingsObj.siteDescription = item.value as string;
        if (item.key === 'adsense_settings') settingsObj.adsenseSettings = item.value as any;
      });

      setSettings(settingsObj);
      
      if (settingsObj.websiteIcon) {
        setIconPreview(settingsObj.websiteIcon);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setIconPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadIcon = async () => {
    if (!iconFile) return null;

    const fileExt = iconFile.name.split('.').pop();
    const fileName = `favicon.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('website-icons')
      .upload(fileName, iconFile, { upsert: true });

    if (error) {
      console.error('Error uploading icon:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('website-icons')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const saveSetting = async (key: string, value: any) => {
    const { error } = await supabase
      .from('admin_settings')
      .upsert({
        key,
        value,
        country_id: authState.profile?.country_id
      });

    if (error) {
      console.error('Error saving setting:', error);
      throw error;
    }
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Upload icon if changed
      let iconUrl = settings.websiteIcon;
      if (iconFile) {
        iconUrl = await uploadIcon();
        if (iconUrl) {
          await saveSetting('website_icon', iconUrl);
          
          // Update favicon in document head
          const existingFavicon = document.querySelector('link[rel="icon"]');
          if (existingFavicon) {
            existingFavicon.setAttribute('href', iconUrl);
          } else {
            const favicon = document.createElement('link');
            favicon.rel = 'icon';
            favicon.href = iconUrl;
            document.head.appendChild(favicon);
          }
        }
      }

      if (settings.siteName) {
        await saveSetting('site_name', settings.siteName);
        document.title = settings.siteName;
      }

      if (settings.siteDescription) {
        await saveSetting('site_description', settings.siteDescription);
      }

      toast({
        title: 'Settings saved',
        description: 'General settings have been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAdsense = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await saveSetting('adsense_settings', settings.adsenseSettings);

      toast({
        title: 'AdSense settings saved',
        description: 'Advertisement settings have been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save AdSense settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin Panel
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Admin Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">
              <Globe className="h-4 w-4 mr-2" />
              General Settings
            </TabsTrigger>
            <TabsTrigger value="advertisements">
              <Settings className="h-4 w-4 mr-2" />
              Advertisements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Website Settings</CardTitle>
                <p className="text-muted-foreground">
                  Configure your website's basic information and appearance.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveGeneral} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="websiteIcon">Website Icon (Favicon)</Label>
                    <div className="flex items-center gap-4">
                      {iconPreview && (
                        <div className="w-12 h-12 border border-border rounded-lg flex items-center justify-center bg-muted">
                          <img 
                            src={iconPreview} 
                            alt="Website icon preview" 
                            className="w-8 h-8 object-contain"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <Input
                          id="websiteIcon"
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                          onChange={handleIconChange}
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Upload a square icon (PNG, JPG, WebP, or SVG) for your website favicon. Max 5MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      type="text"
                      value={settings.siteName || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                      placeholder="My Ad Exchange Platform"
                    />
                    <p className="text-sm text-muted-foreground">
                      The name that appears in the browser title and throughout the site.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Textarea
                      id="siteDescription"
                      value={settings.siteDescription || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                      placeholder="A platform where users can watch ads to earn credits and run their own advertising campaigns."
                      rows={3}
                    />
                    <p className="text-sm text-muted-foreground">
                      A brief description of your platform for SEO and social sharing.
                    </p>
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save General Settings'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advertisements">
            <Card>
              <CardHeader>
                <CardTitle>Advertisement Settings</CardTitle>
                <p className="text-muted-foreground">
                  Configure your AdSense codes and advertisement placements.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveAdsense} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="publisherId">AdSense Publisher ID</Label>
                    <Input
                      id="publisherId"
                      type="text"
                      value={settings.adsenseSettings?.publisherId || ''}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        adsenseSettings: {
                          ...prev.adsenseSettings,
                          publisherId: e.target.value,
                          headerCode: prev.adsenseSettings?.headerCode || '',
                          sidebarCode: prev.adsenseSettings?.sidebarCode || '',
                          footerCode: prev.adsenseSettings?.footerCode || '',
                          viewAdsCode: prev.adsenseSettings?.viewAdsCode || ''
                        }
                      }))}
                      placeholder="ca-pub-xxxxxxxxxxxxxxxxx"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="headerCode">Header Ad Code</Label>
                    <Textarea
                      id="headerCode"
                      value={settings.adsenseSettings?.headerCode || ''}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        adsenseSettings: {
                          ...prev.adsenseSettings,
                          headerCode: e.target.value,
                          publisherId: prev.adsenseSettings?.publisherId || '',
                          sidebarCode: prev.adsenseSettings?.sidebarCode || '',
                          footerCode: prev.adsenseSettings?.footerCode || '',
                          viewAdsCode: prev.adsenseSettings?.viewAdsCode || ''
                        }
                      }))}
                      placeholder="<script async src=&quot;https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js&quot;>...</script>"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sidebarCode">Sidebar Ad Code</Label>
                    <Textarea
                      id="sidebarCode"
                      value={settings.adsenseSettings?.sidebarCode || ''}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        adsenseSettings: {
                          ...prev.adsenseSettings,
                          sidebarCode: e.target.value,
                          publisherId: prev.adsenseSettings?.publisherId || '',
                          headerCode: prev.adsenseSettings?.headerCode || '',
                          footerCode: prev.adsenseSettings?.footerCode || '',
                          viewAdsCode: prev.adsenseSettings?.viewAdsCode || ''
                        }
                      }))}
                      placeholder="<ins class=&quot;adsbygoogle&quot; style=&quot;display:block&quot;>...</ins>"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="viewAdsCode">View Ads Page Ad Code</Label>
                    <Textarea
                      id="viewAdsCode"
                      value={settings.adsenseSettings?.viewAdsCode || ''}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        adsenseSettings: {
                          ...prev.adsenseSettings,
                          viewAdsCode: e.target.value,
                          publisherId: prev.adsenseSettings?.publisherId || '',
                          headerCode: prev.adsenseSettings?.headerCode || '',
                          sidebarCode: prev.adsenseSettings?.sidebarCode || '',
                          footerCode: prev.adsenseSettings?.footerCode || ''
                        }
                      }))}
                      placeholder="<ins class=&quot;adsbygoogle&quot; style=&quot;display:block&quot;>...</ins>"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footerCode">Footer Ad Code</Label>
                    <Textarea
                      id="footerCode"
                      value={settings.adsenseSettings?.footerCode || ''}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        adsenseSettings: {
                          ...prev.adsenseSettings,
                          footerCode: e.target.value,
                          publisherId: prev.adsenseSettings?.publisherId || '',
                          headerCode: prev.adsenseSettings?.headerCode || '',
                          sidebarCode: prev.adsenseSettings?.sidebarCode || '',
                          viewAdsCode: prev.adsenseSettings?.viewAdsCode || ''
                        }
                      }))}
                      placeholder="<ins class=&quot;adsbygoogle&quot; style=&quot;display:block&quot;>...</ins>"
                      rows={4}
                    />
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save Advertisement Settings'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminSettings;