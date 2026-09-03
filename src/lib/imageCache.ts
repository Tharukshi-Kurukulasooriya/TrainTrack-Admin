const memoryCache = new Map<string, HTMLImageElement>();
const loadedUrls = new Set<string>();
const failedUrls = new Set<string>();

// preload a single image url into browser memory
export function preloadImage(src: string | undefined | null): Promise<boolean> {
  if (!src) return Promise.resolve(false);
  if (loadedUrls.has(src)) return Promise.resolve(true);
  if (failedUrls.has(src)) return Promise.resolve(false);

  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;

    // handle cached images that are already complete synchronously
    if (img.complete && img.naturalWidth !== 0) {
      memoryCache.set(src, img);
      loadedUrls.add(src);
      resolve(true);
      return;
    }

    img.onload = () => {
      memoryCache.set(src, img);
      loadedUrls.add(src);
      resolve(true);
    };

    img.onerror = () => {
      failedUrls.add(src);
      resolve(false);
    };
  });
}

// preload an array of image urls in parallel
export function preloadImages(srcs: (string | undefined | null)[]): void {
  if (!srcs || !Array.isArray(srcs)) return;
  srcs.forEach((src) => {
    if (src && !loadedUrls.has(src) && !failedUrls.has(src)) {
      preloadImage(src);
    }
  });
}

// check synchronously if an image is already loaded in memory
export function isImageCached(src: string | undefined | null): boolean {
  if (!src) return false;
  return loadedUrls.has(src);
}

// check synchronously if an image failed to load
export function isImageFailed(src: string | undefined | null): boolean {
  if (!src) return false;
  return failedUrls.has(src);
}
