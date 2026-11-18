import { LucideIcon } from 'lucide-react';

export interface NavItem {
  id: string;
  name: string;
  path: string;
  icon: LucideIcon;
  badge?: string | number;
  badgeColor?: 'green' | 'amber' | 'blue' | 'purple';
  description?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}
