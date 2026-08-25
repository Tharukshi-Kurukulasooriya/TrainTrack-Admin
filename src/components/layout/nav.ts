import {
  BookOpen,
  LayoutDashboard,
  MessageSquareQuote,
  Trophy,
  Users,
} from "lucide-react";

export const NAV_ITEMS = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/trainings", label: "Catalog", icon: BookOpen },
  { to: "/users", label: "Learners", icon: Users },
  { to: "/reviews", label: "Reviews", icon: MessageSquareQuote },
  { to: "/achievements", label: "Achievements", icon: Trophy },
] as const;
