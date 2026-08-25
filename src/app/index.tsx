import { useMemo, useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BookOpen,
  Clock3,
  MessageSquareQuote,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import { CatalogChart } from "@/components/overview/catalog-chart";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { StatTile } from "@/components/shared/stat-tile";
import { Stars } from "@/components/shared/stars";
import { AchievementIcon } from "@/lib/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { categoryIcon } from "@/lib/categories";
import {
  achievementPulse,
  attentionItems,
  averageRating,
  categoryMix,
  monthlyCatalog,
  recentReviews,
  topLearners,
  totalStudyMinutes,
} from "@/lib/dashboard";
import { useAppStore } from "@/hooks/useAppStore";
import { formatHours, formatNumber, formatRelative, initials } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: OverviewPage,
});

function greeting(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function OverviewPage() {
  const ready = useAppStore((s) => s.ready);
  const connection = useAppStore((s) => s.connection);
  const trainings = useAppStore((s) => s.trainings);
  const users = useAppStore((s) => s.users);
  const achievements = useAppStore((s) => s.achievements);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const stats = useMemo(() => {
    const reviews = trainings.flatMap((t) => t.reviews);
    const minutes = totalStudyMinutes(users);
    const premium = trainings.filter((t) => t.trainingIsPremium).length;
    return {
      reviews: reviews.length,
      minutes,
      premium,
      rating: averageRating(trainings),
      series: monthlyCatalog(trainings),
      mix: categoryMix(trainings),
      attention: attentionItems(trainings, users),
      learners: topLearners(users),
      latest: recentReviews(trainings),
      badges: achievementPulse(achievements, users, trainings),
    };
  }, [trainings, users, achievements]);

  if (!ready) return <PageSkeleton />;

  const mixMax = Math.max(1, ...stats.mix.map((item) => item.count));
  const dateLabel = (now ?? new Date()).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="hero-wash -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">{dateLabel}</p>
          <h1 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">
            {now ? `${greeting(now)} Tharukshi. ` : null}
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            {formatNumber(trainings.length)} programs, {formatNumber(users.length)} learners, and a
            house that is still studying.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to="/users">Learners</Link>
          </Button>
          <Button asChild>
            <Link to="/trainings/new">
              <Plus className="size-4" />
              New training
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Catalog"
          value={String(trainings.length)}
          hint={`${stats.premium} premium seats`}
          icon={BookOpen}
        />
        <StatTile
          label="Learners"
          value={String(users.length)}
          hint={`${formatHours(stats.minutes)} studied`}
          icon={Users}
        />
        <StatTile
          label="Reviews"
          value={String(stats.reviews)}
          hint={
            stats.rating ? `${stats.rating.toFixed(1)} house average` : "Awaiting a first voice"
          }
          icon={MessageSquareQuote}
        />
        <StatTile
          label="Study time"
          value={formatHours(stats.minutes)}
          hint="Across every active seat"
          icon={Clock3}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        <Card className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">Pulse</p>
              <h2 className="font-display text-2xl">Catalog arrivals</h2>
            </div>
            <Badge variant="outline">Last 6 months</Badge>
          </div>
          <div className="h-54">
            <CatalogChart data={stats.series} />
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">Mix</p>
          <h2 className="mt-1 font-display text-2xl">By category</h2>
          {stats.mix.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No categories in the catalog yet.</p>
          ) : (
            <ul className="mt-5 space-y-3">
              {stats.mix.slice(0, 6).map((item) => {
                const Icon = categoryIcon(item.label);
                return (
                  <li key={item.label}>
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                      <span className="flex min-w-0 items-center gap-2">
                        <Icon className="size-3.5 shrink-0 text-accent" />
                        <span className="truncate">{item.label}</span>
                      </span>
                      <span className="tabular-nums text-muted-foreground">{item.count}</span>
                    </div>
                    <Progress
                      value={(item.count / mixMax) * 100}
                      className="w-80 h-3 bg-background/60"
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="pb-4">
          <div className="flex items-center justify-between p-5 sm:p-6">
            <h2 className="font-display text-2xl">Needs a look</h2>
            <Sparkles className="size-4 text-accent" />
          </div>
          {stats.attention.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              The floor is quiet. Nothing is waiting on you.
            </p>
          ) : (
            <ul className="space-y-3 px-2 sm:px-4">
              {stats.attention.map((item) => (
                <li key={item.title}>
                  {item.to === "/trainings/$id" && item.id ? (
                    <Link
                      to="/trainings/$id"
                      params={{ id: item.id }}
                      className="group flex items-start justify-between gap-3 rounded-xl p-4 transition-[background-color] duration-150 bg-secondary/60 hover:bg-secondary"
                    >
                      <span>
                        <span className="block text-sm font-medium">{item.title}</span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {item.detail}
                        </span>
                      </span>
                      <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                    </Link>
                  ) : (
                    <Link
                      to="/users"
                      className="group flex items-start justify-between gap-3 rounded-xl bg-secondary px-3 py-3 transition-[background-color] duration-150 hover:bg-secondary/70"
                    >
                      <span>
                        <span className="block text-sm font-medium">{item.title}</span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {item.detail}
                        </span>
                      </span>
                      <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="pb-4">
          <div className="flex items-center justify-between p-5 sm:p-6">
            <h2 className="font-display text-2xl">Latest voice</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/reviews">All</Link>
            </Button>
          </div>
          {stats.latest.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No reviews in the catalog yet.</p>
          ) : (
            <ul className="space-y-3 px-2 sm:px-4">
              {stats.latest.map((review) => (
                <li key={`${review.trainingId}-${review.id}`}>
                  <div className="rounded-xl p-4 transition-[background-color] duration-150 bg-secondary/60 hover:bg-secondary">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{review.reviewerName}</p>
                      <Stars value={review.reviewRating} />
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {review.reviewText}
                    </p>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {review.trainingName} · {formatRelative(review.reviewDate)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5 sm:p-6 lg:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl">Deep work</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/users">Roster</Link>
            </Button>
          </div>
          {stats.learners.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No learners enrolled yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {stats.learners.map(({ user, minutes, completed }) => (
                <li key={user.uid}>
                  <Link
                    to="/users/$id"
                    params={{ id: user.uid }}
                    className="flex items-center gap-3 rounded-xl px-2 py-2 bg-secondary/60 hover:bg-secondary"
                  >
                    <Avatar className="size-9">
                      {user.photoUrl ? <AvatarImage src={user.photoUrl} alt="" /> : null}
                      <AvatarFallback>{initials(user.username || user.email)}</AvatarFallback>
                    </Avatar>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {user.username || "Unnamed"}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {completed} complete · {formatHours(minutes)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="mt-6 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">Motivation</p>
            <h2 className="mt-1 font-display text-2xl">Achievement board</h2>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/achievements">Manage rules</Link>
          </Button>
        </div>
        {stats.badges.length === 0 ? (
          <p className="mt-5 text-sm text-muted-foreground">No achievement rules defined yet.</p>
        ) : (
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.badges.map(({ achievement, unlocked }) => (
              <li key={achievement.id} className="rounded-xl bg-secondary p-4">
                <span className="flex size-9 items-center justify-center rounded-lg bg-card text-accent">
                  <AchievementIcon name={achievement.icon} className="size-4" />
                </span>
                <p className="mt-3 text-sm font-medium">{achievement.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {unlocked} of {users.length} unlocked
                </p>
                <Progress
                  className="mt-3 h-3 bg-background/50"
                  value={users.length === 0 ? 0 : (unlocked / users.length) * 100}
                />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
