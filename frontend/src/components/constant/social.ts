import {
 CalendarDays, ChartNoAxesCombined, Code2, FileText, House,
  Image, Link2, PenLine, Settings, Sparkles, Users
} from 'lucide-react';


export const links = [
    { label: 'Dashboard', path: '/dashboard', icon: House },
    { label: 'Social Accounts', path: '/social-accounts', icon: Link2 },
  { label: 'Create Post', path: '/create', icon: PenLine },
  { label: 'Calendar', path: '/calendar', icon: CalendarDays },
  { label: 'Content', path: '/content', icon: FileText },
  { label: 'Media Library', path: '/media', icon: Image },
  { label: 'Analytics', path: '/analytics', icon: ChartNoAxesCombined },
  { label: 'AI Studio', path: '/ai-studio', icon: Sparkles },
  { label: 'Team & Approvals', path: '/team', icon: Users },
  { label: 'Agent & API', path: '/agent-api', icon: Code2 },
  { label: 'Settings', path: '/settings', icon: Settings }
];