/** Map a raster public URL to its WebP sibling (same path, .webp extension). */
export function webpSrc(src: string): string | null {
  if (!/\.(png|jpe?g)$/i.test(src)) return null;
  return src.replace(/\.(png|jpe?g)$/i, ".webp");
}

export function isRasterImage(src: string): boolean {
  return /\.(png|jpe?g|webp|avif)$/i.test(src);
}

/** Prefer WebP for preload/fetch when a sibling exists. */
export function bestRasterSrc(src: string): string {
  return webpSrc(src) ?? src;
}
