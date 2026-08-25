import type {
  AchievementRecord,
  ReviewRecord,
  TrainingRecord,
  UserRecord,
} from "@/lib/types";

export function evaluateAchievement(
  achievement: AchievementRecord,
  user: UserRecord,
  trainings: TrainingRecord[],
  reviews: ReviewRecord[],
) {
  const progress = Object.values(user.trainingProgress);
  const completed = progress.filter((p) => p.completed);
  const totalMinutes = progress.reduce((sum, p) => sum + p.minutesSpent, 0);
  const userReviews = reviews.filter((r) => r.reviewerId === user.uid);
  const premiumIds = new Set(
    trainings.filter((t) => t.trainingIsPremium).map((t) => t.id),
  );
  const premiumPurchases = user.purchasedTrainings.filter((id) =>
    premiumIds.has(id),
  ).length;

  let current = 0;
  switch (achievement.kind) {
    case "complete_trainings":
      current = completed.length;
      break;
    case "train_minutes_in_day": {
      const byDay = new Map<string, number>();
      for (const p of progress) {
        if (!p.lastActivityAt) continue;
        const day = p.lastActivityAt.slice(0, 10);
        byDay.set(day, (byDay.get(day) ?? 0) + p.minutesSpent);
      }
      current = Math.max(0, ...byDay.values(), 0);
      break;
    }
    case "buy_premium":
      current = premiumPurchases;
      break;
    case "write_reviews":
      current = userReviews.length;
      break;
    case "total_minutes":
      current = totalMinutes;
      break;
    case "watchlist_count":
      current = user.watchlist.length;
      break;
    case "complete_category": {
      const ids = new Set(
        trainings
          .filter((t) => t.trainingCategory === achievement.category)
          .map((t) => t.id),
      );
      current = completed.filter((p) => ids.has(p.trainingId)).length;
      break;
    }
    default:
      current = 0;
  }

  return {
    current,
    unlocked: current >= achievement.threshold,
    ratio: achievement.threshold === 0 ? 1 : Math.min(1, current / achievement.threshold),
  };
}

export function achievementKindLabel(kind: AchievementRecord["kind"]) {
  switch (kind) {
    case "complete_trainings":
      return "Complete trainings";
    case "train_minutes_in_day":
      return "Minutes in one day";
    case "buy_premium":
      return "Buy premium trainings";
    case "write_reviews":
      return "Write reviews";
    case "total_minutes":
      return "Total study minutes";
    case "watchlist_count":
      return "Watchlist items";
    case "complete_category":
      return "Complete a category";
  }
}

export const ACHIEVEMENT_KINDS: AchievementRecord["kind"][] = [
  "complete_trainings",
  "train_minutes_in_day",
  "buy_premium",
  "write_reviews",
  "total_minutes",
  "watchlist_count",
  "complete_category",
];

export const ACHIEVEMENT_ICONS = [
  "Award",
  "Footprints",
  "Timer",
  "Gem",
  "GraduationCap",
  "Flame",
  "MessageSquareQuote",
  "Building2",
  "Bookmark",
  "Trophy",
  "Star",
  "Target",
  "Zap",
  "ShieldCheck",
  "Crown",
] as const;
