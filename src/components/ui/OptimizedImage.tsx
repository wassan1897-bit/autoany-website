import type { ImgHTMLAttributes } from "react";
import { webpSrc } from "../../lib/picture";

type OptimizedImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  /** When true, hints the browser to fetch early (hero / above-fold only). */
  priority?: boolean;
};

/**
 * Serves WebP when a sibling .webp exists under /public, with PNG/JPEG fallback.
 */
export default function OptimizedImage({
  src,
  priority = false,
  loading,
  decoding = "async",
  fetchPriority,
  width,
  height,
  style,
  ...rest
}: OptimizedImageProps) {
  if (!src) return null;

  const webp = webpSrc(src);
  const resolvedLoading = priority ? "eager" : (loading ?? "lazy");
  const resolvedFetchPriority =
    fetchPriority ?? (priority ? "high" : undefined);
  const reservedStyle =
    width && height
      ? { aspectRatio: `${width} / ${height}`, ...style }
      : style;

  if (!webp) {
    return (
      <img
        src={src}
        width={width}
        height={height}
        loading={resolvedLoading}
        decoding={decoding}
        fetchPriority={resolvedFetchPriority}
        style={reservedStyle}
        {...rest}
      />
    );
  }

  return (
    <picture>
      <source srcSet={webp} type="image/webp" />
      <img
        src={src}
        width={width}
        height={height}
        loading={resolvedLoading}
        decoding={decoding}
        fetchPriority={resolvedFetchPriority}
        style={reservedStyle}
        {...rest}
      />
    </picture>
  );
}
