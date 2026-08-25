import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Stars } from "@/components/shared/stars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoryIcon, TRAINING_CATEGORIES } from "@/lib/categories";
import { useAppStore } from "@/hooks/useAppStore";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { PageSkeleton } from "@/components/shared/page-skeleton";

export const Route = createFileRoute("/trainings/")({
  component: TrainingsPage,
});

function TrainingsPage() {
  const ready = useAppStore((s) => s.ready);
  const trainings = useAppStore((s) => s.trainings);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [tier, setTier] = useState<string>("all");

  const filtered = useMemo(() => {
    return trainings.filter((t) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        t.trainingName.toLowerCase().includes(q) ||
        t.trainingAbout.toLowerCase().includes(q) ||
        t.trainingCategory.toLowerCase().includes(q);
      const matchCat = category === "all" || t.trainingCategory === category;
      const matchTier =
        tier === "all" ||
        (tier === "premium" && t.trainingIsPremium) ||
        (tier === "standard" && !t.trainingIsPremium);
      return matchSearch && matchCat && matchTier;
    });
  }, [trainings, search, category, tier]);

  if (!ready) return <PageSkeleton cards={6} />;

  return (
    <div>
      <PageHeader
        eyebrow="Catalog"
        title="Training programs"
        description="Every active training course in the catalog, with modules, reviews, and video resources."
        actions={
          <Button asChild>
            <Link to="/trainings/new">
              <Plus className="size-4" />
              New training
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trainings…"
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {TRAINING_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={tier} onValueChange={setTier}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tiers</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((t) => {
          const Icon = categoryIcon(t.trainingCategory);
          return (
            <Card
              key={t.id}
              className="group flex flex-col overflow-hidden transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-accent/40"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-secondary">
                {t.trainingImage ? (
                  <img
                    src={t.trainingImage}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <BookOpen className="size-10" />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="backdrop-blur-md">
                    <Icon className="mr-1 size-3 text-accent" />
                    {t.trainingCategory || "General"}
                  </Badge>
                  {t.trainingIsPremium ? (
                    <Badge variant="accent">{formatCurrency(t.trainingFee)}</Badge>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h2 className="font-display text-xl leading-snug tracking-tight">
                  <Link to="/trainings/$id" params={{ id: t.id }} className="hover:underline">
                    {t.trainingName}
                  </Link>
                </h2>

                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {t.trainingAbout || t.trainingDescription1}
                </p>

                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Stars value={t.trainingRating} />
                    <span>({t.trainingRatingCount})</span>
                  </div>
                  <span>{t.modules.length} modules</span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4 text-xs text-muted-foreground">
                  <span>{formatNumber(t.trainingEnrolledStudents)} enrolled</span>
                  <Link
                    to="/trainings/$id"
                    params={{ id: t.id }}
                    className="font-semibold text-foreground underline-offset-4 hover:underline"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <Card className="mt-6 flex flex-col items-center p-12 text-center">
          <BookOpen className="size-10 text-muted-foreground" />
          <p className="mt-4 font-display text-2xl">No trainings found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {search || category !== "all" || tier !== "all"
              ? "Try adjusting your search filters."
              : "Click 'New training' above to add your first program."}
          </p>
        </Card>
      ) : null}
    </div>
  );
}
