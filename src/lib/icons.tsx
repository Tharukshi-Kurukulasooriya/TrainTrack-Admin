import type { LucideIcon } from "lucide-react";
import {
  Award,
  Bookmark,
  Building2,
  Crown,
  Flame,
  Footprints,
  Gem,
  GraduationCap,
  MessageSquareQuote,
  ShieldCheck,
  Star,
  Target,
  Timer,
  Trophy,
  Zap,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Award,
  Bookmark,
  Building2,
  Crown,
  Flame,
  Footprints,
  Gem,
  GraduationCap,
  MessageSquareQuote,
  ShieldCheck,
  Star,
  Target,
  Timer,
  Trophy,
  Zap,
};

export function AchievementIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name] ?? Award;
  return <Icon className={className} />;
}
