import { useMemo } from "react";
import { create } from "zustand";
import {
  deleteAchievement,
  fetchAchievements,
  saveAchievement,
} from "@/lib/services/achievementService";
import {
  deleteModule,
  deleteReview,
  deleteTraining,
  fetchTrainings,
  saveModule,
  saveTraining,
  uploadModuleVideo,
  uploadTrainingImage,
} from "@/lib/services/trainingService";
import { deleteUser, fetchUsers, saveUser } from "@/lib/services/userService";
import type {
  AchievementRecord,
  ConnectionState,
  ModuleRecord,
  TrainingRecord,
  UserRecord,
} from "@/lib/types";
import { preloadImages } from "@/lib/imageCache";
import { resolveAvatarUrl } from "@/lib/utils";
import { INBUILT_AVATARS } from "@/lib/services/adminService";

type AppStore = {
  ready: boolean;
  hydrating: boolean;
  connection: ConnectionState;
  trainings: TrainingRecord[];
  users: UserRecord[];
  achievements: AchievementRecord[];
  hydrate: () => Promise<void>;
  upsertTraining: (training: TrainingRecord) => Promise<void>;
  removeTraining: (id: string) => Promise<void>;
  upsertModule: (trainingId: string, module: ModuleRecord) => Promise<void>;
  removeModule: (trainingId: string, moduleId: string) => Promise<void>;
  removeReview: (trainingId: string, reviewId: string) => Promise<void>;
  upsertUser: (user: UserRecord) => Promise<void>;
  removeUser: (uid: string) => Promise<void>;
  upsertAchievement: (achievement: AchievementRecord) => Promise<void>;
  removeAchievement: (id: string) => Promise<void>;
  uploadImage: (trainingId: string, file: File) => Promise<{ url: string; path: string }>;
  uploadVideo: (
    trainingId: string,
    moduleId: string,
    file: File,
  ) => Promise<{ url: string; path: string }>;
};

export const useAppStore = create<AppStore>((set, get) => {
  let hydrateStarted = false;
  return {
    ready: false,
    hydrating: false,
    connection: {
      catalog: "firebase",
      learners: "firebase",
      achievements: "firebase",
      message: "Connecting to database…",
    },
    trainings: [],
    users: [],
    achievements: [],

    hydrate: async () => {
      if (hydrateStarted) return;
      hydrateStarted = true;
      set({ hydrating: true, ready: false });

      try {
        const [remoteTrainings, remoteUsers, remoteAchievements] = await Promise.allSettled([
          fetchTrainings(),
          fetchUsers(),
          fetchAchievements(),
        ]);

        const trainings = remoteTrainings.status === "fulfilled" ? remoteTrainings.value : [];
        const users = remoteUsers.status === "fulfilled" ? remoteUsers.value : [];
        const achievements =
          remoteAchievements.status === "fulfilled" ? remoteAchievements.value : [];

        set({
          ready: true,
          hydrating: false,
          trainings,
          users,
          achievements,
          connection: {
            catalog: "firebase",
            learners: "firebase",
            achievements: "firebase",
            message: "Connected to database.",
          },
        });

        // trigger memory caching for all images
        const imageUrlsToPreload = [
          ...trainings.map((t) => t.trainingImage),
          ...users.map((u) => resolveAvatarUrl(u.photoUrl)),
          ...trainings.flatMap((t) => t.reviews.map((r) => resolveAvatarUrl(r.photoUrl))),
          ...INBUILT_AVATARS.map((av) => av.path),
        ];
        preloadImages(imageUrlsToPreload);
      } catch (error) {
        console.error("Failed to hydrate database", error);
        set({
          ready: true,
          hydrating: false,
          connection: {
            catalog: "firebase",
            learners: "firebase",
            achievements: "firebase",
            message: "Error connecting to database.",
          },
        });
      }
    },

    upsertTraining: async (training) => {
      const next = [training, ...get().trainings.filter((t) => t.id !== training.id)].sort(
        (a, b) => new Date(b.trainingAddedDate).getTime() - new Date(a.trainingAddedDate).getTime(),
      );
      set({ trainings: next });
      await saveTraining(training);
    },

    removeTraining: async (id) => {
      const existing = get().trainings.find((t) => t.id === id);
      set({ trainings: get().trainings.filter((t) => t.id !== id) });
      if (existing) {
        await deleteTraining(existing);
      }
    },

    upsertModule: async (trainingId, module) => {
      const trainings = get().trainings.map((t) =>
        t.id === trainingId
          ? {
              ...t,
              modules: [module, ...t.modules.filter((m) => m.id !== module.id)],
            }
          : t,
      );
      set({ trainings });
      await saveModule(trainingId, module);
    },

    removeModule: async (trainingId, moduleId) => {
      const current = get().trainings.find((t) => t.id === trainingId);
      const module = current?.modules.find((m) => m.id === moduleId);
      const trainings = get().trainings.map((t) =>
        t.id === trainingId ? { ...t, modules: t.modules.filter((m) => m.id !== moduleId) } : t,
      );
      set({ trainings });
      if (module) {
        await deleteModule(trainingId, module);
      }
    },

    removeReview: async (trainingId, reviewId) => {
      const trainings = get().trainings.map((t) => {
        if (t.id !== trainingId) return t;
        const reviews = t.reviews.filter((r) => r.id !== reviewId);
        const count = reviews.length;
        const average =
          count === 0 ? 0 : reviews.reduce((sum, review) => sum + review.reviewRating, 0) / count;
        return {
          ...t,
          reviews,
          trainingRatingCount: count,
          trainingRating: average,
        };
      });
      set({ trainings });
      await deleteReview(trainingId, reviewId);
      const updated = trainings.find((t) => t.id === trainingId);
      if (updated) {
        await saveTraining(updated);
      }
    },

    upsertUser: async (user) => {
      const users = [user, ...get().users.filter((u) => u.uid !== user.uid)];
      set({ users });
      await saveUser(user);
    },

    removeUser: async (uid) => {
      const users = get().users.filter((u) => u.uid !== uid);
      set({ users });
      await deleteUser(uid);
    },

    upsertAchievement: async (achievement) => {
      const achievements = [
        achievement,
        ...get().achievements.filter((a) => a.id !== achievement.id),
      ];
      set({ achievements });
      await saveAchievement(achievement);
    },

    removeAchievement: async (id) => {
      const achievements = get().achievements.filter((a) => a.id !== id);
      set({ achievements });
      await deleteAchievement(id);
    },

    uploadImage: async (trainingId, file) => {
      try {
        const result = await uploadTrainingImage(trainingId, file);
        return { url: result.url, path: result.path };
      } catch (error) {
        console.warn("Image upload fallback to object URL", error);
        return { url: URL.createObjectURL(file), path: "" };
      }
    },

    uploadVideo: async (trainingId, moduleId, file) => {
      try {
        const result = await uploadModuleVideo(trainingId, moduleId, file);
        return { url: result.url, path: result.path };
      } catch (error) {
        console.warn("Video upload fallback to object URL", error);
        return { url: URL.createObjectURL(file), path: "" };
      }
    },
  };
});

export function useAllReviews() {
  const trainings = useAppStore((s) => s.trainings);
  return useMemo(
    () => trainings.flatMap((t) => t.reviews.map((r) => ({ ...r, trainingName: t.trainingName }))),
    [trainings],
  );
}
