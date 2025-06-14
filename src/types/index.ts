export interface User {
  id: number;
  username: string;
  email: string;
  creditBalance: number;
  createdAt: string;
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