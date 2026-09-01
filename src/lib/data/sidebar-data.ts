import {
  BookOpen,
  LayoutDashboard,
  MessageSquareQuote,
  Settings,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";

export type SidebarItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  countKey?: "trainings" | "users" | "reviews" | "achievements" | "admins";
  badge?: string | number;
};

export type SidebarGroupData = {
  label?: string;
  items: SidebarItem[];
};

export const sidebarItems: SidebarGroupData[] = [
  {
    label: "Dashboards",
    items: [
      { title: "Overview", href: "/", icon: LayoutDashboard },
      { title: "Catalog", href: "/trainings", icon: BookOpen, countKey: "trainings" },
      { title: "Employees", href: "/users", icon: Users, countKey: "users" },
      { title: "Feedbacks", href: "/reviews", icon: MessageSquareQuote, countKey: "reviews" },
      { title: "Achievements", href: "/achievements", icon: Trophy, countKey: "achievements" },
    ],
  },
  {
    label: "Governance",
    items: [
      { title: "Admin Users", href: "/admins", icon: ShieldCheck, countKey: "admins" },
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
];
