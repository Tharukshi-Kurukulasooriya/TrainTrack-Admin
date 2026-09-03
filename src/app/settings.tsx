import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  CheckCircle2,
  Moon,
  RotateCcw,
  Sparkles,
  Sun,
  Palette,
  Sliders,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { THEME_COLORS, ThemeColor, ThemeMode, useThemeStore } from "@/lib/themeStore";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { useAuthStore } from "@/lib/authStore";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const mode = useThemeStore((s) => s.mode);
  const themeColor = useThemeStore((s) => s.themeColor);
  const setMode = useThemeStore((s) => s.setMode);
  const setThemeColor = useThemeStore((s) => s.setThemeColor);
  const isModerator = useAuthStore((s) => s.currentAdmin?.role === "moderator");

  const handleModeChange = (newMode: ThemeMode) => {
    setMode(newMode);
    toast.success(`Theme mode set to ${newMode === "dark" ? "Dark Mode" : "Light Mode"}`);
  };

  const handleThemeColorChange = (colorId: ThemeColor) => {
    setThemeColor(colorId);
    const colorObj = THEME_COLORS.find((c) => c.id === colorId);
    toast.success(`Theme color set to ${colorObj?.name || colorId}`);
  };

  const handleResetDefaults = () => {
    setMode("dark");
    setThemeColor("cyan");
    toast.success("Settings restored to defaults (Dark Mode & Cyan Theme).");
  };

  return (
    <div className="hero-wash -m-6 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <PageHeader
        eyebrow="system Preferences"
        title="Settings & Customization"
        description="Customize display mode, choose your preferred theme accent color, and manage interface
            behavior."
        actions={
          <Button variant="outline" size="sm" onClick={handleResetDefaults} disabled={isModerator}>
            <RotateCcw className="size-3.5" />
            Reset Defaults
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-12">
        {/* left column */}
        <div className="lg:col-span-7 space-y-5">
          {/* light / dark mode card */}
          <Card className="p-5 sm:p-6 space-y-6 relative flex flex-col overflow-visible">
            <span className="absolute -top-3 -right-3 z-10 flex items-center justify-center rounded-md px-3 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ring-1 ring-background bg-accent/70 text-accent-foreground">
              {mode} Mode Active
            </span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-accent/15 text-accent shrink-0">
                  {mode === "dark" ? <Moon className="size-5" /> : <Sun className="size-5" />}
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold">Display Mode</h2>
                  <p className="text-xs text-muted-foreground">
                    Switch between Dark Mode and Light Mode interface themes.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* dark mode card */}
              <button
                type="button"
                disabled={isModerator}
                onClick={() => handleModeChange("dark")}
                className={cn(
                  "relative flex flex-col justify-between rounded-lg border p-4 text-left transition-all duration-200 cursor-pointer overflow-visible",
                  mode === "dark"
                    ? "border-accent bg-card shadow-lg ring-1 ring-accent/30"
                    : "border-border/60 bg-card/40 hover:border-border hover:bg-card/70 opacity-75 hover:opacity-100",
                )}
              >
                {mode === "dark" && (
                  <span className="absolute -top-2.5 -right-2.5 z-10 flex size-6 items-center justify-center rounded-md bg-accent text-accent-foreground shadow-sm ring-2 ring-background">
                    <Check className="size-4 stroke-3" />
                  </span>
                )}
                <div className="w-full space-y-2">
                  <div className="flex items-start gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-zinc-100 border border-zinc-700 shadow-sm mt-0.5">
                      <Moon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-foreground">Dark Mode</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                        Sleek dark theme optimized for low-light environments.
                      </p>
                    </div>
                  </div>
                </div>

                {/* micro preview box */}
                <div className="mt-4 w-full rounded-lg bg-[#0d1117] p-2.5 border border-zinc-800 space-y-1.5 pointer-events-none">
                  <div className="h-2 w-1/2 rounded bg-zinc-700" />
                  <div className="h-1.5 w-3/4 rounded bg-zinc-800" />
                  <div className="flex items-center gap-1 pt-1">
                    <div className="size-3 rounded-full bg-accent" />
                    <div className="h-1.5 flex-1 rounded bg-zinc-700" />
                  </div>
                </div>
              </button>

              {/* light mode card */}
              <button
                type="button"
                disabled={isModerator}
                onClick={() => handleModeChange("light")}
                className={cn(
                  "relative flex flex-col justify-between rounded-lg border p-4 text-left transition-all duration-200 cursor-pointer overflow-visible",
                  mode === "light"
                    ? "border-accent bg-card shadow-lg ring-1 ring-accent/30"
                    : "border-border/60 bg-card/40 hover:border-border hover:bg-card/70 opacity-75 hover:opacity-100",
                )}
              >
                {mode === "light" && (
                  <span className="absolute -top-2.5 -right-2.5 z-10 flex size-6 items-center justify-center rounded-md bg-accent text-accent-foreground shadow-sm ring-2 ring-background">
                    <Check className="size-4 stroke-3" />
                  </span>
                )}
                <div className="w-full space-y-2">
                  <div className="flex items-start gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500 border border-amber-500/30 shadow-sm mt-0.5">
                      <Sun className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-foreground">Light Mode</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                        Clean bright theme for high-contrast day usage.
                      </p>
                    </div>
                  </div>
                </div>

                {/* micro preview box */}
                <div className="mt-4 w-full rounded-lg bg-slate-100 p-2.5 border border-slate-300 space-y-1.5 pointer-events-none">
                  <div className="h-2 w-1/2 rounded bg-slate-300" />
                  <div className="h-1.5 w-3/4 rounded bg-slate-200" />
                  <div className="flex items-center gap-1 pt-1">
                    <div className="size-3 rounded-full bg-accent" />
                    <div className="h-1.5 flex-1 rounded bg-slate-300" />
                  </div>
                </div>
              </button>
            </div>
          </Card>

          {/* color selector */}
          <Card className="p-5 sm:p-6 space-y-6 mb-10">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-accent/15 text-accent shrink-0">
                <Palette className="size-5" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold">Theme Color</h2>
                <p className="text-xs text-muted-foreground">
                  Choose the primary accent color used across buttons, badges, graphs, and
                  indicators.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {THEME_COLORS.map((color) => {
                const isSelected = themeColor === color.id;
                return (
                  <button
                    key={color.id}
                    type="button"
                    disabled={isModerator}
                    onClick={() => handleThemeColorChange(color.id)}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg border p-3.5 text-left transition-all duration-200 cursor-pointer",
                      isSelected
                        ? "border-accent bg-accent/10 shadow-md ring-1 ring-accent/30 font-semibold"
                        : "border-border/60 bg-card/50 hover:border-border hover:bg-card",
                    )}
                  >
                    <span
                      className={cn(
                        "relative flex size-7 shrink-0 items-center justify-center rounded-full shadow-sm transition-transform duration-200 group-hover:scale-110",
                      )}
                      style={{ backgroundColor: color.hex }}
                    >
                      {isSelected && <Check className="size-4 text-white stroke-3" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-foreground truncate">{color.name}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* live preview */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-5 sm:p-6 space-y-6 sticky top-24 border-accent/30 bg-card/80 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <h3 className="font-display text-lg font-bold">Live Interface Preview</h3>
              <Badge variant="secondary" className="text-[10px]">
                Interactive
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border border-accent/10 bg-accent/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-accent/20 text-accent font-bold text-xs">
                      TT
                    </span>
                    <span className="text-xs font-bold text-foreground">Catalog Overview</span>
                  </div>
                  <Badge className="bg-accent text-accent-foreground text-[10px]">Active</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  See how active elements, buttons, and progress indicators adopt your chosen theme
                  color.
                </p>

                {/* progress bar preview */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Target completion</span>
                    <span className="font-mono font-bold text-accent">85%</span>
                  </div>
                  <Progress value={85} className="h-2.5 bg-background/60" />
                </div>
              </div>

              {/* sample action Buttons */}
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Button & Accent Styles
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    Primary Accent
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-accent text-accent hover:bg-accent/10"
                  >
                    Outline Accent
                  </Button>
                  <Button size="sm" variant="secondary">
                    Secondary
                  </Button>
                </div>
              </div>

              {/* sample badges */}
              <div className="space-y-2 pt-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Badges & Glow Indicators
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                    <CheckCircle2 className="size-3.5" />
                    Accent Badge
                  </span>
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-accent" />
                  </span>
                  <span className="text-xs font-medium text-foreground">Live Pulse Indicator</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
