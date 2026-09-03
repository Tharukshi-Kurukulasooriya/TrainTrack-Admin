import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        duration: 4000,
        classNames: {
          toast:
            "group toast relative overflow-hidden bg-card text-foreground border-border shadow-[var(--shadow-elevated)] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-right after:scale-x-100 after:bg-accent/60 after:transition-transform after:duration-[4000ms] data-[mounted=true]:after:scale-x-0",
          description: "text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-secondary text-secondary-foreground",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
