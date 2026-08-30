import {
  AlertTriangle,
  BookOpen,
  LayoutDashboard,
  MessageSquareQuote,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";

export type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  countKey?: "trainings" | "users" | "reviews" | "achievements" | "admins";
};

export const NAV_ITEMS: readonly NavItem[] = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/trainings", label: "Catalog", icon: BookOpen, countKey: "trainings" },
  { to: "/users", label: "Learners", icon: Users, countKey: "users" },
  { to: "/reviews", label: "Feedbacks", icon: MessageSquareQuote, countKey: "reviews" },
  { to: "/achievements", label: "Achievements", icon: Trophy, countKey: "achievements" },
  { to: "/admins", label: "Admin Users", icon: ShieldCheck, countKey: "admins" },
] as const;
