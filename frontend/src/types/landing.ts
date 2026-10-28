import type { ReactNode } from 'react';
import type { Theme } from '../hooks/useTheme';
import type { Platform } from '../constant/content';
import type { AppRoute } from '../constant/routes';

export enum LandingSectionId {
  Features = 'features',
  HowItWorks = 'how-it-works'
}

export enum FeatureId {
  AiStudio = 'ai-studio',
  Calendar = 'calendar',
  Publishing = 'publishing',
  Accounts = 'accounts',
  Analytics = 'analytics',
  Approvals = 'approvals'
}

export enum StepId {
  Connect = 'connect',
  Create = 'create',
  Publish = 'publish'
}

export enum ShowcaseId {
  AiStudio = 'ai-studio',
  Calendar = 'calendar',
  Analytics = 'analytics'
}

export type IconProps = { size?: number; strokeWidth?: number; className?: string };
// A plain call signature accepts both lucide icons and the custom brand icons.
export type IconComponent = (props: IconProps) => ReactNode;

export type ThemedSource = Record<Theme, string>;
export type LandingImage = { sources: ThemedSource; alt: string; width: number; height: number };

export type AnchorLink = { label: string; href: string };
export type RouteLink = { label: string; to: AppRoute };

export type FeatureItem = { id: FeatureId; icon: IconComponent; title: string; description: string };
export type StepItem = { id: StepId; title: string; description: string };
export type IntegrationItem = { platform: Platform; icon: IconComponent; iconSize: number };

export type ShowcaseItem = {
  id: ShowcaseId;
  icon: IconComponent;
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
  url: string;
  image: LandingImage;
};

export type FooterGroup = { title: string; links: (AnchorLink | RouteLink)[] };
