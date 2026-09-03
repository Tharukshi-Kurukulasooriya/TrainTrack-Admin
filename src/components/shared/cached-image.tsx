import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { isImageCached, isImageFailed, preloadImage } from "@/lib/imageCache";

interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
}

export function CachedImage({ src, alt = "", className, fallback, ...props }: CachedImageProps) {
  const [loaded, setLoaded] = useState(() => Boolean(src && isImageCached(src)));
  const [error, setError] = useState(() => Boolean(src && isImageFailed(src)));

  useEffect(() => {
    if (!src) {
      setLoaded(false);
      setError(true);
      return;
    }

    if (isImageCached(src)) {
      setLoaded(true);
      setError(false);
      return;
    }

    let isMounted = true;
    preloadImage(src).then((success) => {
      if (isMounted) {
        setLoaded(success);
        setError(!success);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [src]);

  if (error && fallback) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={src}
      alt={alt}
      decoding="async"
      loading="eager"
      className={cn(
        "transition-opacity duration-150",
        loaded ? "opacity-100" : "opacity-0",
        className,
      )}
      {...props}
    />
  );
}
