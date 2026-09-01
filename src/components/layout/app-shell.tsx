import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, Plus, Search } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { CommandPalette } from "@/components/layout/command-palette";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAppStore } from "@/lib/data/store";
import { useAuthStore } from "@/lib/authStore";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrate = useAppStore((s) => s.hydrate);
  const hydrating = useAppStore((s) => s.hydrating);
  const ready = useAppStore((s) => s.ready);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      void hydrate();
    }
  }, [hydrate, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated && pathname !== "/login") {
      void navigate({ to: "/login" });
    }
  }, [isAuthenticated, pathname, navigate]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (pathname === "/login") {
    return <div className="min-h-dvh bg-background text-foreground">{children}</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-dvh w-full bg-background text-foreground">
        <Sidebar pathname={pathname} />

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-72 p-0">
            <Sidebar pathname={pathname} onNavigate={() => setMobileOpen(false)} isMobile />
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 flex-col min-w-0">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-2 backdrop-blur-sm sm:px-4">
            {hydrating || !ready ? (
              <span className="absolute inset-x-0 bottom-0 h-px overflow-hidden">
                <span className="block h-full w-1/3 bg-accent motion-safe:animate-pulse" />
              </span>
            ) : null}

            <SidebarTrigger className="hidden md:inline-flex" />

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </Button>

            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-card px-3 text-left text-sm text-muted-foreground transition-[border-color] duration-150 hover:border-ring/50 sm:max-w-md"
            >
              <Search className="size-4 shrink-0" />
              <span className="truncate">Search catalog, employees, reviews</span>
              <kbd className="ml-auto hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
                ⌘ K
              </kbd>
            </button>
            <Button asChild size="sm" className="shrink-0">
              <Link to="/trainings/new">
                <Plus className="size-4" />
                <span className="hidden sm:inline">New training</span>
                <span className="sm:hidden">New</span>
              </Link>
            </Button>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
        <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      </div>
    </SidebarProvider>
  );
}
