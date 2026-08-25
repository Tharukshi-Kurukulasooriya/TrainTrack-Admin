import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">{label}</p>
        <span className="flex size-8 items-center justify-center rounded-md bg-secondary text-accent">
          <Icon className="size-4" />
        </span>
      </div>
      <p className="font-display text-3xl tracking-tight tabular-nums">{value}</p>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </Card>
  );
}
