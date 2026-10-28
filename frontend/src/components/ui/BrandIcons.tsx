import type { ReactNode } from 'react';
import type { IconProps } from '../../types/landing';

// lucide-react only ships outline versions of these brands (and no TikTok or X), so these
// filled glyphs follow its IconProps contract to sit alongside the lucide icons.
function BrandSvg({ size = 24, className, viewBox = '0 0 24 24', children }: IconProps & { viewBox?: string; children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox={viewBox} fill="currentColor" className={className} aria-hidden="true">
      {children}
    </svg>
  );
}

export function TikTokIcon(props: IconProps) {
  return (
    <BrandSvg {...props}>
      <path d="M12.53 0h3.4a5.4 5.4 0 0 0 .2 1.27 5.4 5.4 0 0 0 3.7 3.6c.55.17 1.1.26 1.67.28v3.5a9 9 0 0 1-5.57-1.92v8.63A7.1 7.1 0 0 1 8.9 22.5a7.1 7.1 0 0 1-3.97-1.2 7.1 7.1 0 0 1 4.57-12.85v3.62a3.5 3.5 0 0 0-2.8 6.3 3.5 3.5 0 0 0 5.5-2.87V0Z" />
    </BrandSvg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <BrandSvg {...props} viewBox="-4 -4 32 32">
      <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41Z" />
    </BrandSvg>
  );
}

export function LinkedInIcon(props: IconProps) {
  return (
    <BrandSvg {...props}>
      <path fillRule="evenodd" d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm3.2 4.1a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8ZM6 10v7h2.4v-7H6Zm4 0v7h2.4v-3.7c0-1.2.6-1.9 1.6-1.9s1.5.7 1.5 1.9V17H18v-4.3c0-2.4-1.1-3.7-3.2-3.7-1 0-1.9.4-2.4 1.1V10H10Z" />
    </BrandSvg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <BrandSvg {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2Z" />
    </BrandSvg>
  );
}
