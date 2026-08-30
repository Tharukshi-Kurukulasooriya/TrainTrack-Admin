import {
  AlertTriangle,
  BookOpen,
  LayoutDashboard,
  MessageSquareQuote,
  Trophy,
  Users,
} from "lucide-react";

export type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  countKey?: "trainings" | "users" | "reviews" | "achievements";
};

export const NAV_ITEMS: readonly NavItem[] = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/trainings", label: "Catalog", icon: BookOpen, countKey: "trainings" },
  { to: "/users", label: "Learners", icon: Users, countKey: "users" },
  { to: "/reviews", label: "Feedbacks", icon: MessageSquareQuote, countKey: "reviews" },
  { to: "/achievements", label: "Achievements", icon: Trophy, countKey: "achievements" },
  { to: "/issues", label: "Reported Issues", icon: AlertTriangle, countKey: "achievements" },
] as const;
