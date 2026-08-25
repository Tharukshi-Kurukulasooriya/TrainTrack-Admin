import { evaluateAchievement } from "@/lib/achievements";
import type {
  AchievementRecord,
  TrainingRecord,
  UserRecord,
} from "@/lib/types";

export function totalStudyMinutes(users: UserRecord[]) {
  return users.reduce((sum, user) => {
    return (
      sum +
      Object.values(user.trainingProgress).reduce(
        (inner, item) => inner + item.minutesSpent,
        0,
      )
    );
  }, 0);
}

export function completedCount(user: UserRecord) {
  return Object.values(user.trainingProgress).filter((item) => item.completed)
    .length;
}

export function monthlyCatalog(trainings: TrainingRecord[]) {
  const buckets: { key: string; label: string; count: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    buckets.push({
      key,
      label: date.toLocaleDateString("en-US", { month: "short" }),
      count: 0,
    });
  }
  for (const training of trainings) {
    const key = training.trainingAddedDate.slice(0, 7);
    const bucket = buckets.find((item) => item.key === key);
    if (bucket) bucket.count += 1;
  }
  return buckets;
}

export function categoryMix(trainings: TrainingRecord[]) {
  const map = new Map<string, number>();
  for (const training of trainings) {
    const key = training.trainingCategory || "Uncategorized";
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export function averageRating(trainings: TrainingRecord[]) {
  const rated = trainings.filter((t) => t.trainingRatingCount > 0);
  if (rated.length === 0) return 0;
  const weighted = rated.reduce(
    (sum, t) => sum + t.trainingRating * t.trainingRatingCount,
    0,
  );
  const count = rated.reduce((sum, t) => sum + t.trainingRatingCount, 0);
  return count === 0 ? 0 : weighted / count;
}

export function attentionItems(trainings: TrainingRecord[], users: UserRecord[]) {
  const items: {
    title: string;
    detail: string;
    to: "/trainings/$id" | "/users";
    id?: string;
  }[] = [];
  for (const training of trainings) {
    if (training.trainingRatingCount > 0 && training.trainingRating < 3.6) {
      items.push({
        title: `${training.trainingName} is cooling`,
        detail: `${training.trainingRating.toFixed(1)} average from ${training.trainingRatingCount} reviews`,
        to: "/trainings/$id",
        id: training.id,
      });
    }
    if (training.reviews.length === 0 && training.modules.length > 0) {
      items.push({
        title: `${training.trainingName} has no voice yet`,
        detail: "Published with modules, still waiting on a first review",
        to: "/trainings/$id",
        id: training.id,
      });
    }
  }
  const idle = users.filter(
    (user) => Object.keys(user.trainingProgress).length === 0,
  );
  if (idle.length > 0) {
    items.push({
      title: `${idle.length} learner${idle.length === 1 ? "" : "s"} still idle`,
      detail: idle
        .slice(0, 3)
        .map((u) => u.username)
        .join(", "),
      to: "/users",
    });
  }
  return items.slice(0, 4);
}

export function topLearners(users: UserRecord[]) {
  return [...users]
    .map((user) => {
      const minutes = Object.values(user.trainingProgress).reduce(
        (sum, item) => sum + item.minutesSpent,
        0,
      );
      return { user, minutes, completed: completedCount(user) };
    })
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 5);
}

export function recentReviews(trainings: TrainingRecord[]) {
  return trainings
    .flatMap((training) =>
      training.reviews.map((review) => ({
        ...review,
        trainingName: training.trainingName,
      })),
    )
    .sort(
      (a, b) =>
        new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime(),
    )
    .slice(0, 4);
}

export function achievementPulse(
  achievements: AchievementRecord[],
  users: UserRecord[],
  trainings: TrainingRecord[],
) {
  const reviews = trainings.flatMap((t) => t.reviews);
  return achievements
    .filter((item) => item.isActive)
    .map((achievement) => {
      const unlocked = users.filter(
        (user) =>
          evaluateAchievement(achievement, user, trainings, reviews).unlocked,
      ).length;
      return { achievement, unlocked };
    })
    .sort((a, b) => b.unlocked - a.unlocked)
    .slice(0, 4);
}
