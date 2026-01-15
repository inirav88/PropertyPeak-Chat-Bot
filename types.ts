
export enum FeatureStatus {
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED'
}

export interface BotFeature {
  id: string;
  category: string;
  name: string;
  description: string;
  status: FeatureStatus;
  icon: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  type: 'Buyer' | 'Seller' | 'Tenant';
  budget: string;
  location: string;
  status: 'New' | 'Contacted' | 'Visit Done' | 'Negotiation' | 'Closed';
  lastActive: string;
  score: number;
  leadSource?: string;
}

export interface Property {
  id: string;
  title: string;
  type: string;
  price: string;
  location: string;
  images: string[];
}
