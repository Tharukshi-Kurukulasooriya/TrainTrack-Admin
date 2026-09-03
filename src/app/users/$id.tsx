import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Award, BookOpen, Calendar, Clock, Trophy } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/hooks/useAppStore";
import { evaluateAchievement } from "@/lib/achievements";
import { AchievementIcon } from "@/lib/icons";
import { formatDate, formatHours, formatRelative, initials, resolveAvatarUrl } from "@/lib/utils";
import { PageSkeleton } from "@/components/shared/page-skeleton";

export const Route = createFileRoute("/users/$id")({
  component: UserDetailPage,
});

function UserDetailPage() {
  const { id } = Route.useParams();
  const ready = useAppStore((s) => s.ready);
  const user = useAppStore((s) => s.users.find((u) => u.uid === id));
  const trainings = useAppStore((s) => s.trainings);
  const achievements = useAppStore((s) => s.achievements);

  const reviews = useMemo(() => trainings.flatMap((t) => t.reviews), [trainings]);

  const userAchievements = useMemo(() => {
    if (!user) return [];
    return achievements.map((a) => {
      const result = evaluateAchievement(a, user, trainings, reviews);
      return {
        achievement: a,
        ...result,
      };
    });
  }, [achievements, user, trainings, reviews]);

  const unlockedCount = userAchievements.filter((a) => a.unlocked).length;

  if (!ready) return <PageSkeleton cards={3} />;

  if (!user) {
    return (
      <Card className="flex flex-col items-center p-12 text-center">
        <p className="font-display text-2xl">Learner profile not found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          No learner with ID "{id}" was found in the database.
        </p>
        <Button asChild className="mt-6">
          <Link to="/users">Back to roster</Link>
        </Button>
      </Card>
    );
  }

  const progressList = Object.values(user.trainingProgress);
  const completed = progressList.filter((p) => p.completed);
  const totalMins = progressList.reduce((sum, p) => sum + p.minutesSpent, 0);

  return (
    <div>
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/users">
            <ArrowLeft className="mr-1 size-4" />
            Roster
          </Link>
        </Button>
      </div>

      <PageHeader
        eyebrow="Learner profile"
        title={user.username || "Unnamed learner"}
        description={user.email}
        actions={
          <Badge variant="outline" className="text-xs">
            {user.source === "firebase" ? "Firebase auth seat" : "Local seat"}
          </Badge>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <div className="flex flex-col items-center text-center">
            <Avatar className="size-40 overflow-hidden border border-border/80 shadow-sm">
              {user.photoUrl ? (
                <AvatarImage
                  src={resolveAvatarUrl(user.photoUrl)}
                  alt={user.username || "User avatar"}
                  className="h-full w-full object-cover"
                />
              ) : null}
              <AvatarFallback className="text-6xl">
                {initials(user.username || user.email)}
              </AvatarFallback>
            </Avatar>
            <h2 className="mt-4 font-display text-2xl">{user.username || "Unnamed"}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>

          <div className="mt-6 space-y-4 border-t border-border/60 pt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="size-4" />
                Completed
              </span>
              <span className="font-medium">{completed.length} programs</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Clock className="size-4" />
                Study time
              </span>
              <span className="font-medium">{formatHours(totalMins)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Trophy className="size-4" />
                Daily goal
              </span>
              <span className="font-medium">{user.studyGoalMinutes} mins/day</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="size-4" />
                Created at
              </span>
              <span className="font-medium">{formatDate(user.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Award className="size-4" />
                Achievements
              </span>
              <span className="font-medium">
                {unlockedCount} / {achievements.length} unlocked
              </span>
            </div>
          </div>

          {achievements.length > 0 ? (
            <div className="mt-6 border-t border-border/60 pt-6">
              <h3 className="font-display text-lg">Achievements details</h3>
              <ul className="mt-3 space-y-3">
                {userAchievements.map(({ achievement, unlocked, current, ratio }) => (
                  <li
                    key={achievement.id}
                    className={`rounded-lg border p-3 transition-colors ${
                      unlocked ? "border-accent/10 bg-accent/6" : "border-border/50 bg-secondary/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                            unlocked ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <AchievementIcon name={achievement.icon} className="size-4" />
                        </span>
                        <div className="truncate">
                          <p className="text-sm font-medium leading-tight truncate">
                            {achievement.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                      <Badge variant={unlocked ? "accent" : "outline"} className="shrink-0 text-xs">
                        {unlocked ? "Unlocked" : `${Math.round(ratio * 100)}%`}
                      </Badge>
                    </div>
                    {!unlocked ? (
                      <div className="mt-2 space-y-1">
                        <Progress value={Math.round(ratio * 100)} className="h-1.5 bg-background" />
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                          <span>Progress</span>
                          <span>
                            {current} / {achievement.threshold}
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <h2 className="font-display text-2xl">Training progress</h2>
            {progressList.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No active training progress recorded yet.
              </p>
            ) : (
              <ul className="mt-4 space-y-4">
                {progressList.map((p) => {
                  const percent =
                    p.totalSteps > 0 ? Math.round((p.currentStep / p.totalSteps) * 100) : 0;
                  return (
                    <li key={p.trainingId} className="rounded-lg bg-accent/6 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <Link
                          to="/trainings/$id"
                          params={{ id: p.trainingId }}
                          className="font-medium text-foreground hover:underline"
                        >
                          {p.trainingName}
                        </Link>
                        <Badge variant={p.completed ? "accent" : "secondary"}>
                          {p.completed ? "Completed" : `${percent}%`}
                        </Badge>
                      </div>
                      <Progress value={percent} className="mt-3 h-3 bg-background" />
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          Step {p.currentStep} of {p.totalSteps} · {p.minutesSpent} mins spent
                        </span>
                        {p.lastActivityAt ? (
                          <span>Last: {formatRelative(p.lastActivityAt)}</span>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-2xl">Watchlist & Purchases</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs tracking-wider text-muted-foreground uppercase">
                  Watchlist ({user.watchlist.length})
                </p>
                <ul className="mt-2 space-y-2">
                  {user.watchlist.map((id) => {
                    const t = trainings.find((tr) => tr.id === id);
                    return (
                      <li key={id} className="text-sm font-medium">
                        {t ? (
                          <Link
                            to="/trainings/$id"
                            params={{ id: t.id }}
                            className="hover:underline"
                          >
                            {t.trainingName}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">{id}</span>
                        )}
                      </li>
                    );
                  })}
                  {user.watchlist.length === 0 ? (
                    <li className="text-xs text-muted-foreground">Watchlist is empty.</li>
                  ) : null}
                </ul>
              </div>

              <div>
                <p className="text-xs tracking-wider text-muted-foreground uppercase">
                  Purchased ({user.purchasedTrainings.length})
                </p>
                <ul className="mt-2 space-y-2">
                  {user.purchasedTrainings.map((id) => {
                    const t = trainings.find((tr) => tr.id === id);
                    return (
                      <li key={id} className="text-sm font-medium">
                        {t ? (
                          <Link
                            to="/trainings/$id"
                            params={{ id: t.id }}
                            className="hover:underline"
                          >
                            {t.trainingName}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">{id}</span>
                        )}
                      </li>
                    );
                  })}
                  {user.purchasedTrainings.length === 0 ? (
                    <li className="text-xs text-muted-foreground">No purchases yet.</li>
                  ) : null}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
