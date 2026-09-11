import type { CSSProperties } from 'react';

type SourceImage = string | number | { uri?: string };

type ImageProps = {
  accessibilityLabel?: string;
  alt?: string;
  cachePolicy?: string;
  onError?: () => void;
  source?: SourceImage;
  style?: CSSProperties;
};

const lireSource = (source: SourceImage | undefined): string | undefined => {
  if (typeof source === 'object') return source.uri;
  return source === undefined ? undefined : String(source);
};

export const Image = ({
  accessibilityLabel,
  alt,
  cachePolicy,
  onError,
  source,
  style,
}: ImageProps) => (
  <img
    alt={alt ?? accessibilityLabel}
    data-cache-policy={cachePolicy}
    onError={onError}
    src={lireSource(source)}
    style={style}
  />
);
