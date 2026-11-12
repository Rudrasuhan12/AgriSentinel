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

