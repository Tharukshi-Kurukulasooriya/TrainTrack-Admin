import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const [animatedValue, setAnimatedValue] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value || 0);
    }, 1200);

    return () => clearTimeout(timer);
  }, [value]);

  return (
    <ProgressPrimitive.Root
      className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-secondary", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full rounded-r-full bg-linear-to-r from-secondary via-accent/40 to-accent transition-all duration-1600 ease-out"
        style={{ width: `${animatedValue}%` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
