import { CalendarDays, ChartNoAxesCombined, Instagram, Layers, Link2, Sparkles, Users } from 'lucide-react';
import { FacebookIcon, LinkedInIcon, TikTokIcon, XIcon } from '../components/ui/BrandIcons';
import mainDark from '../assets/landing/main-dark.png';
import mainLight from '../assets/landing/main-light.png';
import calendarDark from '../assets/landing/calendar-dark.png';
import calendarLight from '../assets/landing/calendar-light.png';
import { Platform } from './content';
import { AppRoute } from './routes';
import {
  FeatureId, LandingSectionId, ShowcaseId, StepId,
  type AnchorLink, type FeatureItem, type FooterGroup, type IntegrationItem, type LandingImage, type ShowcaseItem, type StepItem
} from '../types/landing';

const sectionHref = (id: LandingSectionId) => `#${id}`;

const MAIN_SIZE = { width: 1901, height: 861 };
const CALENDAR_SIZE = { width: 1052, height: 662 };
const mainSources = { light: mainLight, dark: mainDark };
const calendarSources = { light: calendarLight, dark: calendarDark };

export const BRAND = { name: 'Sway', wordmark: 'Orbit', tagline: 'Your social media, smarter with AI.' };
export const COPYRIGHT_YEAR = new Date().getFullYear();

export const NAV_LINKS: AnchorLink[] = [
  { label: 'Features', href: sectionHref(LandingSectionId.Features) },
  { label: 'How It Works', href: sectionHref(LandingSectionId.HowItWorks) }
];

export const NAV_ACTIONS = { signIn: 'Sign In', signUp: 'Get Started Free' };

export const HERO = {
  badge: 'Your unfair advantage, powered by AI',
  titleLead: 'Your Social Media.',
  titleAccent: 'Smarter with AI.',
  description: 'Create content worth sharing. Schedule it everywhere. Bring your entire social presence into one beautifully simple workspace.',
  cta: 'Start for Free',
  note: 'No credit card required · Free plan available'
};

export const DASHBOARD_PREVIEW: { url: string; caption: string; image: LandingImage } = {
  url: 'app.Orbit.so / overview',
  caption: 'One workspace. Every channel. Zero chaos.',
  image: {
    sources: mainSources,
    alt: 'Orbitdashboard showing scheduled posts, connected accounts and upcoming content',
    ...MAIN_SIZE
  }
};

export const INTEGRATIONS_HEADING = 'All your channels. Finally together.';

export const INTEGRATIONS: IntegrationItem[] = [
  { platform: Platform.Instagram, icon: Instagram, iconSize: 26 },
  { platform: Platform.LinkedIn, icon: LinkedInIcon, iconSize: 24 },
  { platform: Platform.TikTok, icon: TikTokIcon, iconSize: 20 },
  { platform: Platform.X, icon: XIcon, iconSize: 18 },
  { platform: Platform.Facebook, icon: FacebookIcon, iconSize: 22 }
];

export const FEATURES_SECTION = {
  eyebrow: 'Features',
  title: 'Everything you need to run social, in one place',
  description: 'From the first idea to the published post, Orbitkeeps your whole workflow in a single, simple workspace.'
};

export const FEATURES: FeatureItem[] = [
  { id: FeatureId.AiStudio, icon: Sparkles, title: 'Write with AI', description: 'Generate captions and ideas in your brand voice, then refine them in seconds.' },
  { id: FeatureId.Calendar, icon: CalendarDays, title: 'Visual content calendar', description: 'Plan the week or month visually and see everything you have scheduled at a glance.' },
  { id: FeatureId.Publishing, icon: Layers, title: 'Publish everywhere', description: 'Send one post to every connected channel at exactly the time you chose.' },
  { id: FeatureId.Accounts, icon: Link2, title: 'Connect in a few clicks', description: 'Link your social accounts and manage all of them from a single workspace.' },
  { id: FeatureId.Analytics, icon: ChartNoAxesCombined, title: 'Know what works', description: 'Track reach, engagement and post status so you can do more of what performs.' },
  { id: FeatureId.Approvals, icon: Users, title: 'Team approvals', description: 'Review and approve posts before they go live, so every message stays on brand.' }
];

export const SHOWCASE_SECTION = {
  eyebrow: 'Product',
  title: 'A closer look at your new workspace',
  description: 'Designed to stay out of your way, so you can focus on content worth sharing.'
};

export const SHOWCASES: ShowcaseItem[] = [
  {
    id: ShowcaseId.AiStudio,
    icon: Sparkles,
    eyebrow: 'AI studio',
    title: 'Go from idea to ready-to-post in seconds',
    description: 'Describe what you want to say and let the AI studio draft captions you can edit, save and schedule.',
    points: ['Captions in your brand voice', 'Variations for every channel', 'Edit and approve before publishing'],
    url: 'app.Orbit.so / ai-studio',
    image: { sources: mainSources, alt: 'Orbit workspace dashboard with calendar and AI assistant', ...MAIN_SIZE }
  },
  {
    id: ShowcaseId.Calendar,
    icon: CalendarDays,
    eyebrow: 'Calendar',
    title: 'See your whole content plan at a glance',
    description: 'Pick a date and time visually and watch your week fill up, with the status of every post one look away.',
    points: ['Week and month views', 'Scheduled, published and draft states', 'Times shown in your local timezone'],
    url: 'app.Orbit.so / calendar',
    image: { sources: calendarSources, alt: 'Orbit content calendar with scheduled posts', ...CALENDAR_SIZE }
  },
  {
    id: ShowcaseId.Analytics,
    icon: ChartNoAxesCombined,
    eyebrow: 'Analytics',
    title: 'Understand what resonates with your audience',
    description: 'Follow performance across every channel in one dashboard and turn the results into your next post.',
    points: ['Reach and engagement per channel', 'Top performing content', 'Weekly progress at a glance'],
    url: 'app.Orbit.so / analytics',
    image: { sources: mainSources, alt: 'Orbit dashboard with channel performance and scheduled content', ...MAIN_SIZE }
  }
];

export const HOW_IT_WORKS_SECTION = {
  eyebrow: 'How it works',
  title: 'Three steps, then it runs on its own',
  description: 'Get set up in minutes and let Orbithandle the repetitive part.'
};

export const STEPS: StepItem[] = [
  { id: StepId.Connect, title: 'Connect your channels', description: 'Link your social accounts in a few clicks. No developer setup required.' },
  { id: StepId.Create, title: 'Create and schedule', description: 'Draft with the AI studio, pick your media, then choose the perfect time on the calendar.' },
  { id: StepId.Publish, title: 'Orbitdoes the rest', description: 'Your post goes out at the scheduled time and every status stays up to date in one place.' }
];

export const FINAL_CTA = {
  title: 'Ready to put your social media on autopilot?',
  description: 'Create your account and schedule your first post in minutes.',
  cta: 'Start for Free'
};

export const FOOTER_GROUPS: FooterGroup[] = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: sectionHref(LandingSectionId.Features) },
      { label: 'How It Works', href: sectionHref(LandingSectionId.HowItWorks) }
    ]
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign In', to: AppRoute.SignIn },
      { label: 'Get Started Free', to: AppRoute.SignUp }
    ]
  }
];
