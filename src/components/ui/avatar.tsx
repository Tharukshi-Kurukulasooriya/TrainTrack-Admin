import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import { isImageCached, preloadImage } from "@/lib/imageCache";

function Avatar({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      className={cn("relative flex size-9 shrink-0 overflow-hidden rounded-full", className)}
      {...props}
    />
  );
}

function AvatarImage({ className, src, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  const [loaded, setLoaded] = React.useState(() => Boolean(src && isImageCached(src)));

  React.useEffect(() => {
    if (!src) return;
    if (isImageCached(src)) {
      setLoaded(true);
      return;
    }
    let isMounted = true;
    preloadImage(src).then((success) => {
      if (isMounted && success) {
        setLoaded(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [src]);

  if (loaded && src) {
    return (
      <img
        src={src}
        alt=""
        decoding="async"
        loading="eager"
        className={cn("aspect-square size-full object-cover", className)}
        {...(props as React.ImgHTMLAttributes<HTMLImageElement>)}
      />
    );
  }

  return (
    <AvatarPrimitive.Image
      src={src}
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
