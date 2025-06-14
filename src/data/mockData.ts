import { User, Campaign, Ad } from '@/types';

export const mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    creditBalance: 1000,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    username: 'john_doe',
    email: 'john@example.com',
    creditBalance: 150,
    createdAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 3,
    username: 'jane_smith',
    email: 'jane@example.com',
    creditBalance: 200,
    createdAt: '2024-01-03T00:00:00Z',
  },
];

export const mockCampaigns: Campaign[] = [
  {
    id: 1,
    userId: 2,
    campaignName: 'Summer Sale Campaign',
    totalBudgetCredits: 100,
    remainingBudgetCredits: 85,
    status: 'active',
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 2,
    userId: 3,
    campaignName: 'New Product Launch',
    totalBudgetCredits: 150,
    remainingBudgetCredits: 150,
    status: 'pending_approval',
    createdAt: '2024-01-16T00:00:00Z',
  },
  {
    id: 3,
    userId: 2,
    campaignName: 'Holiday Special',
    totalBudgetCredits: 75,
    remainingBudgetCredits: 30,
    status: 'active',
    createdAt: '2024-01-10T00:00:00Z',
  },
];

export const mockAds: Ad[] = [
  {
    id: 1,
    campaignId: 1,
    adCreativePath: '/uploads/summer-sale.jpg',
    targetUrl: 'https://example.com/summer-sale',
  },
  {
    id: 2,
    campaignId: 3,
    adCreativePath: '/uploads/holiday-special.jpg',
    targetUrl: 'https://example.com/holiday-special',
  },
];

// Helper function to get ads with campaign data
export const getAdsWithCampaigns = () => {
  return mockAds.map(ad => ({
    ...ad,
    campaign: mockCampaigns.find(c => c.id === ad.campaignId),
  }));
};