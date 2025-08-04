
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthProvider';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useAdminData } from '@/hooks/useAdminData';
import { useCampaignActions } from '@/hooks/useCampaignActions';
import { useCountryData } from '@/hooks/useCountryData';
import AdminHeader from '@/components/admin/AdminHeader';
import AccessDeniedCard from '@/components/admin/AccessDeniedCard';
import CampaignCard from '@/components/admin/CampaignCard';
import EmptyState from '@/components/admin/EmptyState';
import GlobalHeader from '@/components/GlobalHeader';

const AdminPanel = () => {
  const { authState } = useAuth();
  const { userCountry } = useCountryData();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const { campaigns, setCampaigns, loading: dataLoading, getCampaignOwner } = useAdminData(isAdmin);
  const { handleApprove, handleReject } = useCampaignActions(campaigns, setCampaigns);

  // Debug logging
  console.log('AdminPanel Debug:', {
    isAuthenticated: authState.isAuthenticated,
    userCountry: userCountry?.name,
    isAdmin,
    adminLoading,
    dataLoading,
    campaignsCount: campaigns.length,
    userId: authState.user?.id
  });

  if (!authState.isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to dashboard if no country selected
  if (!userCountry) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!isAdmin && !adminLoading) {
    return <AccessDeniedCard />;
  }

  if (adminLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader />
      <AdminHeader />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Campaign Approval - {userCountry.name}</h2>
          <p className="text-muted-foreground">
            Review and approve pending ad campaigns for {userCountry.name}.
          </p>
        </div>

        {campaigns.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {campaigns.map((campaign) => {
              const owner = getCampaignOwner(campaign.user_id);
              
              return (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  owner={owner}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
