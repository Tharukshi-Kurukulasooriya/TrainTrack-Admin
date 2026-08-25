import { useAppStore } from "@/hooks/useAppStore";

export function useTrainings() {
  const trainings = useAppStore((s) => s.trainings);
  const upsertTraining = useAppStore((s) => s.upsertTraining);
  const removeTraining = useAppStore((s) => s.removeTraining);
  const upsertModule = useAppStore((s) => s.upsertModule);
  const removeModule = useAppStore((s) => s.removeModule);
  const removeReview = useAppStore((s) => s.removeReview);
  const uploadImage = useAppStore((s) => s.uploadImage);
  const uploadVideo = useAppStore((s) => s.uploadVideo);

  return {
    trainings,
    upsertTraining,
    removeTraining,
    upsertModule,
    removeModule,
    removeReview,
    uploadImage,
    uploadVideo,
  };
}
