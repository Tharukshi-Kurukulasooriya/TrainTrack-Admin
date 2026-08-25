import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  BookOpen,
  Briefcase,
  GitBranch,
  Handshake,
  HeartPulse,
  Landmark,
  MessageCircle,
  Scale,
  Shield,
  Sparkles,
  Users,
  UserRound,
  Wallet,
  Wrench,
} from "lucide-react";

export const TRAINING_CATEGORIES = [
  "Onboarding & Orientation",
  "Leadership & Management",
  "Compliance & Legal",
  "Cybersecurity & Data Privacy",
  "Workplace Safety & Health",
  "Soft Skills & Communication",
  "Customer Service & Support",
  "Diversity, Equity & Inclusion",
  "Sales & Negotiation",
  "Project Management",
  "Technical & Role Skills",
  "Quality Assurance & Standards",
  "Finance & Budgeting",
  "Professional Development",
] as const;

export type TrainingCategory = (typeof TRAINING_CATEGORIES)[number];

export const CATEGORY_PREFIX: Record<TrainingCategory, string> = {
  "Onboarding & Orientation": "ONB",
  "Leadership & Management": "LDR",
  "Compliance & Legal": "CMP",
  "Cybersecurity & Data Privacy": "CYB",
  "Workplace Safety & Health": "SAF",
  "Soft Skills & Communication": "SFT",
  "Customer Service & Support": "CSS",
  "Diversity, Equity & Inclusion": "DEI",
  "Sales & Negotiation": "SAL",
  "Project Management": "PRJ",
  "Technical & Role Skills": "TEC",
  "Quality Assurance & Standards": "QAS",
  "Finance & Budgeting": "FIN",
  "Professional Development": "PRO",
};

export const CATEGORY_ICON: Record<TrainingCategory, LucideIcon> = {
  "Onboarding & Orientation": UserRound,
  "Leadership & Management": Users,
  "Compliance & Legal": Scale,
  "Cybersecurity & Data Privacy": Shield,
  "Workplace Safety & Health": HeartPulse,
  "Soft Skills & Communication": MessageCircle,
  "Customer Service & Support": Handshake,
  "Diversity, Equity & Inclusion": Sparkles,
  "Sales & Negotiation": Briefcase,
  "Project Management": GitBranch,
  "Technical & Role Skills": Wrench,
  "Quality Assurance & Standards": BadgeCheck,
  "Finance & Budgeting": Wallet,
  "Professional Development": BookOpen,
};

export function categoryIcon(name: string): LucideIcon {
  return CATEGORY_ICON[name as TrainingCategory] ?? Landmark;
}

export function suggestTrainingId(category: string, existingIds: string[]) {
  const prefix =
    CATEGORY_PREFIX[category as TrainingCategory] ?? slugPrefix(category);
  const year = new Date().getFullYear();
  let n = 1;
  while (true) {
    const id = `${prefix}-${year}-${String(n).padStart(3, "0")}`;
    if (!existingIds.includes(id)) return id;
    n += 1;
  }
}

function slugPrefix(category: string) {
  return category
    .split(/\s+/)
    .filter((w) => w.length > 2 && w !== "&")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .padEnd(3, "X");
}
