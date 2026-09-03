import * as React from "react";
import { PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const SIDEBAR_WIDTH = "15rem";
const SIDEBAR_WIDTH_ICON = "3.5rem";

type SidebarContext = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContext | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  const [_open, _setOpen] = React.useState(() => {
    const saved = localStorage.getItem("sidebar_state");
    return saved !== null ? saved === "expanded" : defaultOpen;
  });
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
        localStorage.setItem("sidebar_state", openState ? "expanded" : "collapsed");
      }
    },
    [setOpenProp, open],
  );

  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((o) => !o) : setOpen((o) => !o);
  }, [isMobile, setOpen, setOpenMobile]);

  const state = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo<SidebarContext>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper flex min-h-svh w-full text-sidebar-foreground",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

export function Sidebar({
  collapsible = "icon",
  className,
  children,
  ...props
}: React.ComponentProps<"aside"> & {
  collapsible?: "icon" | "none";
}) {
  const { state } = useSidebar();

  if (collapsible === "none") {
    return (
      <div
        className={cn("flex h-full w-full flex-col bg-sidebar text-sidebar-foreground", className)}
      >
        {children}
      </div>
    );
  }

  return (
    <aside
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      className={cn(
        "group peer relative z-30 hidden md:block text-sidebar-foreground transition-[width] duration-300 ease-in-out shrink-0",
        state === "expanded" ? "w-(--sidebar-width)" : "w-(--sidebar-width-icon)",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex h-full flex-col bg-sidebar border-r border-sidebar-border transition-[width] duration-300 ease-in-out",
          state === "expanded" ? "w-(--sidebar-width)" : "w-(--sidebar-width-icon)",
        )}
      >
        {children}
      </div>
    </aside>
  );
}

export function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8 text-muted-foreground hover:text-foreground", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeft className="size-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

export function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-sidebar="header"
      className={cn(
        "flex flex-col gap-2 p-3 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:items-center",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-sidebar="footer"
      className={cn(
        "flex flex-col gap-2 p-3 mt-auto group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:items-center",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-sidebar="content"
      className={cn(
        "flex flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden p-2 group-data-[collapsible=icon]:overflow-hidden group-data-[collapsible=icon]:items-center",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-sidebar="group"
      className={cn(
        "relative flex w-full min-w-0 flex-col p-1 group-data-[collapsible=icon]:items-center",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarGroupLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-sidebar="group-label"
      className={cn(
        "duration-200 flex h-7 shrink-0 items-center rounded-md px-2 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider outline-none group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarGroupContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-sidebar="group-content"
      className={cn(
        "w-full text-sm group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-sidebar="menu"
      className={cn(
        "flex w-full min-w-0 flex-col gap-1 group-data-[collapsible=icon]:items-center",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-sidebar="menu-item"
      className={cn(
        "group/menu-item relative list-none w-full group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
  isActive?: boolean;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  tooltip?: string;
}) {
  const { isMobile, state } = useSidebar();

  const buttonClass = cn(
    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150 outline-none cursor-pointer select-none",
    "hover:bg-accent/10 hover:text-foreground",
    isActive ? "bg-accent/15 text-foreground" : "text-muted-foreground",
    variant === "outline" && "border border-sidebar-border bg-card/60 hover:bg-card",
    size === "lg" && "h-12 px-3",
    size === "sm" && "h-10 text-xs px-2",
    size === "default" && "h-9",
    "group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:shrink-0",
    className,
  );

  let content: React.ReactNode;

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ className?: string }>;
    content = React.cloneElement(child, {
      className: cn(buttonClass, child.props.className),
    });
  } else {
    content = (
      <button className={buttonClass} {...props}>
        {children}
      </button>
    );
  }

  if (!tooltip) {
    return content;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side="right" align="center" hidden={state !== "collapsed" || isMobile}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

export function SidebarMenuBadge({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-sidebar="menu-badge"
      className={cn(
        "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs tabular-nums rounded-md bg-accent/8 px-1.5 py-0.5 text-muted-foreground group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}
