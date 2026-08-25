import { useAppStore } from "@/hooks/useAppStore";

export function useAchievements() {
  const achievements = useAppStore((s) => s.achievements);
  const upsertAchievement = useAppStore((s) => s.upsertAchievement);
  const removeAchievement = useAppStore((s) => s.removeAchievement);

  return {
    achievements,
    upsertAchievement,
    removeAchievement,
  };
}
