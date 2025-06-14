export interface User {
  id: number;
  username: string;
  email: string;
  creditBalance: number;
  createdAt: string;
  role?: 'admin' | 'user';
}

export interface Campaign {
  id: number;
  userId: number;
  campaignName: string;
  totalBudgetCredits: number;
  remainingBudgetCredits: number;
  status: 'pending_approval' | 'active' | 'paused' | 'completed';
  createdAt: string;
}

export interface Ad {
  id: number;
  campaignId: number;
  adCreativePath: string;
  targetUrl: string;
  campaign?: Campaign;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface AdSenseSettings {
  headerAdCode: string;
  sidebarAdCode: string;
  footerAdCode: string;
  viewAdsAdCode: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  tags: string[];
  slug: string;
  status: 'draft' | 'published';
  createdAt: string;
  publishedAt?: string;
  readTime: number;
}