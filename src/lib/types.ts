export type ModuleRecord = {
  id: string;
  moduleName: string;
  moduleVideo: string;
  videoPath: string;
  moduleNote: string;
};

export type ReviewRecord = {
  id: string;
  trainingId: string;
  reviewerName: string;
  reviewerId: string;
  reviewDate: string;
  reviewRating: number;
  reviewText: string;
};

export type TrainingRecord = {
  id: string;
  trainingName: string;
  trainingAbout: string;
  trainingDescription1: string;
  trainingDescription2: string;
  trainingDescription3: string;
  trainingCategory: string;
  trainingImage: string;
  trainingImagePath: string;
  trainingKeyFeatures: string[];
  trainingIsPremium: boolean;
  trainingFee: number;
  trainingRating: number;
  trainingRatingCount: number;
  trainingEnrolledStudents: number;
  trainingAddedDate: string;
  modules: ModuleRecord[];
  reviews: ReviewRecord[];
};

export type TrainingProgress = {
  trainingId: string;
  trainingName: string;
  currentStep: number;
  totalSteps: number;
  minutesSpent: number;
  completed: boolean;
  lastActivityAt: string | null;
};

export type UserRecord = {
  uid: string;
  username: string;
  email: string;
  photoUrl: string;
  watchlist: string[];
  purchasedTrainings: string[];
  trainingProgress: Record<string, TrainingProgress>;
  studyGoalMinutes: number;
  createdAt: string;
  source: "firebase" | "workspace";
};

export type AchievementKind =
  | "complete_trainings"
  | "train_minutes_in_day"
  | "buy_premium"
  | "write_reviews"
  | "total_minutes"
  | "watchlist_count"
  | "complete_category";

export type AchievementRecord = {
  id: string;
  name: string;
  description: string;
  icon: string;
  kind: AchievementKind;
  threshold: number;
  category: string;
  isActive: boolean;
  createdAt: string;
};

export type AdminRole = "super_admin" | "admin" | "moderator";

export type AdminRecord = {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: AdminRole;
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt?: string | null;
  isActive: boolean;
};

export type DataSource = "firebase" | "workspace" | "mixed";

export type ConnectionState = {
  catalog: DataSource;
  learners: DataSource;
  achievements: DataSource;
  message: string;
};
