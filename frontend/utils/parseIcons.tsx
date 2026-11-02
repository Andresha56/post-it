import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Instagram,
  facebook,
  linkedin,
  Twitter,
  Youtube,
  Music2,
  Globe,
} from 'lucide-react';
import { normalizeValue, platformColors } from "../src/constant/content";

export function ParsePlatformIcon({ platform }: { platform: string }) {
  const normalized = normalizeValue(platform);

  const iconProps = {
    size: 12,
    strokeWidth: 2.5,
    color: platformColors[normalized] ??    'currentColor',
  };

  switch (normalized) {
    case 'INSTAGRAM':
      return <Instagram {...iconProps} />;

    case 'FACEBOOK':
      return <facebook {...iconProps} />;

    case 'LINKEDIN':
      return <linkedin {...iconProps} />;

    case 'TWITTER':
    case 'X':
      return <Twitter {...iconProps} />;

    case 'YOUTUBE':
      return <Youtube {...iconProps} />;

    case 'TIKTOK':
      return <Music2 {...iconProps} />;

    default:
      return <Globe {...iconProps} />;
  }
}
