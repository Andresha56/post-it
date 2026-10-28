import { memo, type ImgHTMLAttributes } from 'react';
import { useTheme } from '../../hooks/useTheme';
import type { LandingImage } from '../../types/landing';

type Props = LandingImage & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'width' | 'height'>;

// Renders only the active theme's source, so the hidden variant is never downloaded.
export const ThemedImage = memo(function ThemedImage({ sources, alt, width, height, loading = 'lazy', decoding = 'async', ...props }: Props) {
  const { theme } = useTheme();
  return <img src={sources[theme]} alt={alt} width={width} height={height} loading={loading} decoding={decoding} {...props} />;
});
