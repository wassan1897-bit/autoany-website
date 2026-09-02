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
  ...rest
}: OptimizedImageProps) {
  if (!src) return null;

  const webp = webpSrc(src);
  const resolvedLoading = priority ? "eager" : (loading ?? "lazy");
  const resolvedFetchPriority =
    fetchPriority ?? (priority ? "high" : undefined);

  if (!webp) {
    return (
      <img
        src={src}
        loading={resolvedLoading}
        decoding={decoding}
        fetchPriority={resolvedFetchPriority}
        {...rest}
      />
    );
  }

  return (
    <picture>
      <source srcSet={webp} type="image/webp" />
      <img
        src={src}
        loading={resolvedLoading}
        decoding={decoding}
        fetchPriority={resolvedFetchPriority}
        {...rest}
      />
    </picture>
  );
}
