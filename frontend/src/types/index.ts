export enum UserRole {
  FARMER = 'FARMER',
  GOVERNMENT_OFFICIAL = 'GOVERNMENT_OFFICIAL',
  ADMIN = 'ADMIN'
}

export type AccountStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface UserProfile {
  id: string;
  email: string | null;
  full_name?: string;
  display_name: string;
  mobile_number: string | null;
  role: UserRole;
  account_status: AccountStatus;
  is_mobile_verified: boolean;
  is_email_verified: boolean;
  created_at: string;
  profile?: Record<string, any>;
  farmer_profile?: {
    district?: string;
    sub_district?: string;
    village?: string;
    total_land_holding_acres?: number;
    crop_variety?: string;
    [key: string]: any;
  };
}

export interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

export interface MetricItem {
  title: string;
  subtitle: string;
  tag: string;
  iconName: string;
}

export interface TechModule {
  id: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  capabilities: string[];
  metrics: { label: string; value: string }[];
  accentColor: string;
  badge: string;
}

export interface WorkflowStep {
  step: string;
  title: string;
  phase: string;
  description: string;
  deliverable: string;
  telemetry: string;
}

export interface PreviewTab {
  id: string;
  title: string;
  category: string;
  description: string;
}
