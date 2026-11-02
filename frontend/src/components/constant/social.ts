import {
 CalendarDays, ChartNoAxesCombined,  FileText, House,
  Link2, PenLine, Settings, Users
} from 'lucide-react';


export const links = [
  { label: 'Dashboard', path: '/dashboard', icon: House },
  { label: 'Social Accounts', path: '/social-accounts', icon: Link2 },
  { label: 'Create Post', path: '/create', icon: PenLine },
  { label: 'Calendar', path: '/calendar', icon: CalendarDays },
  { label: 'Content', path: '/content', icon: FileText },
  { label: 'Analytics', path: '/analytics', icon: ChartNoAxesCombined },
  { label: 'Team & Approvals', path: '/team', icon: Users },
  { label: 'Settings', path: '/settings', icon: Settings }
];