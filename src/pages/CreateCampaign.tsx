
import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/SupabaseAuthProvider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCountryData } from '@/hooks/useCountryData';
import GlobalHeader from '@/components/GlobalHeader';
import { ArrowLeft, Upload, Coins } from 'lucide-react';

const CreateCampaign = () => {
  const { authState, updateCredits } = useAuth();
  const { userCountry, loading: countryLoading } = useCountryData();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [campaignName, setCampaignName] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState(50);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  useEffect(() => {
    fetchCategories();
    if (userCountry) {
      fetchStates();
    }
  }, [userCountry]);

  useEffect(() => {
    if (selectedState) {
      fetchCities();
    } else {
      setCities([]);
      setSelectedCity('');
    }
  }, [selectedState]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (!error && data) {
      setCategories(data);
    }
  };

  const fetchStates = async () => {
    if (!userCountry) return;
    
    const { data, error } = await supabase
      .from('states')
      .select('*')
      .eq('country_id', userCountry.id)
      .eq('is_active', true)
      .order('name');
    
    if (!error && data) {
      setStates(data);
    }
  };

  const fetchCities = async () => {
    if (!selectedState) return;
    
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('state_id', selectedState)
      .eq('is_active', true)
      .order('name');
    
    if (!error && data) {
      setCities(data);
    }
  };

  if (!authState.isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Wait for country to load to avoid false redirect
  if (countryLoading) {
    return (
      <div className="min-h-screen bg-background">
        <GlobalHeader />
        <main className="max-w-4xl mx-auto px-4 py-16">
          <p className="text-muted-foreground">Loading your country settings...</p>
        </main>
      </div>
    );
  }

  // Redirect to dashboard if no country selected after loading
  if (!userCountry) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const estimatedViews = Math.floor(budget / 5);
  const userCredits = authState.profile?.credits || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authState.user || !authState.profile || !userCountry) {
      toast({
        title: 'Error',
        description: 'User not authenticated or country not selected.',
        variant: 'destructive',
      });
      return;
    }

    if (userCredits < budget) {
      toast({
        title: 'Insufficient credits',
        description: `You need ${budget} credits but only have ${userCredits}.`,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create campaign in database with country_id
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          user_id: authState.user.id,
          campaign_name: campaignName,
          total_budget_credits: budget,
          remaining_budget_credits: budget,
          status: 'pending_approval',
          country_id: userCountry.id,
          category_id: selectedCategory || null,
          state_id: selectedState || null,
          city_id: selectedCity || null
        })
        .select()
        .single();

      if (campaignError) {
        console.error('Error creating campaign:', campaignError);
        toast({
          title: 'Error',
          description: 'Failed to create campaign.',
          variant: 'destructive',
        });
        return;
      }

      // Deduct credits from user
      const newCreditBalance = userCredits - budget;
      const { error: creditError } = await supabase
        .from('profiles')
        .update({ credits: newCreditBalance })
        .eq('user_id', authState.user.id);

      if (creditError) {
        console.error('Error updating credits:', creditError);
        // Rollback campaign creation if credit update fails
        await supabase.from('campaigns').delete().eq('id', campaign.id);
        toast({
          title: 'Error',
          description: 'Failed to process payment.',
          variant: 'destructive',
        });
        return;
      }

      // Update local credits
      await updateCredits(newCreditBalance);

      // Create ad entry if image was uploaded
      if (selectedImage && campaign) {
        const { error: adError } = await supabase
          .from('ads')
          .insert({
            campaign_id: campaign.id,
            ad_creative_path: URL.createObjectURL(selectedImage),
            target_url: targetUrl
          });

        if (adError) {
          console.error('Error creating ad:', adError);
        }
      }

      toast({
        title: 'Campaign created successfully!',
        description: `Your campaign "${campaignName}" has been submitted for approval in ${userCountry.name}.`,
      });

      navigate('/my-campaigns');
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader />
      
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Create New Campaign</h1>
          </div>
          <div className="flex items-center gap-2 text-sm bg-primary/10 px-3 py-2 rounded-lg">
            <Coins className="h-4 w-4 text-primary" />
            <span className="font-medium">{userCredits} credits</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <p className="text-muted-foreground">
              Create your advertising campaign. All campaigns require admin approval before going live.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="campaignName">Campaign Name</Label>
                <Input
                  id="campaignName"
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="Enter campaign name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetUrl">Target URL</Label>
                <Input
                  id="targetUrl"
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your campaign..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province (Optional)</Label>
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state/province" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state.id} value={state.id}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City (Optional)</Label>
                  <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedState}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Budget (Credits)</Label>
                <Input
                  id="budget"
                  type="number"
                  min="10"
                  max={userCredits}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Estimated views: <span className="font-medium">{estimatedViews}</span> (5 credits per view)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adImage">Ad Creative</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    id="adImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <label htmlFor="adImage" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {selectedImage ? selectedImage.name : 'Click to upload your ad image'}
                    </p>
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Campaign Summary:</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Budget: {budget} credits</li>
                  <li>• Estimated views: {estimatedViews}</li>
                  <li>• Cost per view: 5 credits</li>
                  <li>• Status: Pending approval</li>
                </ul>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || userCredits < budget}
              >
                {isLoading ? 'Creating Campaign...' : `Create Campaign (${budget} credits)`}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateCampaign;
