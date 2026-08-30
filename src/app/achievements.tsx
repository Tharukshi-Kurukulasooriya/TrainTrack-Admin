import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trophy } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDelete } from "@/components/shared/confirm-delete";
import { AchievementIcon } from "@/lib/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ACHIEVEMENT_ICONS,
  ACHIEVEMENT_KINDS,
  achievementKindLabel,
  evaluateAchievement,
} from "@/lib/achievements";
import { TRAINING_CATEGORIES } from "@/lib/categories";
import { useAppStore } from "@/hooks/useAppStore";
import type { AchievementRecord } from "@/lib/types";
import { PageSkeleton } from "@/components/shared/page-skeleton";

export const Route = createFileRoute("/achievements")({
  component: AchievementsPage,
});

const emptyForm = (): AchievementRecord => ({
  id: `ach-${crypto.randomUUID().slice(0, 8)}`,
  name: "",
  description: "",
  icon: "Award",
  kind: "complete_trainings",
  threshold: 3,
  category: "",
  isActive: true,
  createdAt: new Date().toISOString(),
});

function AchievementsPage() {
  const ready = useAppStore((s) => s.ready);
  const achievements = useAppStore((s) => s.achievements);
  const users = useAppStore((s) => s.users);
  const trainings = useAppStore((s) => s.trainings);
  const upsertAchievement = useAppStore((s) => s.upsertAchievement);
  const removeAchievement = useAppStore((s) => s.removeAchievement);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<AchievementRecord>(emptyForm);
  const [pending, setPending] = useState<string | null>(null);
  const reviews = trainings.flatMap((t) => t.reviews);

  if (!ready) return <PageSkeleton cards={3} />;

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Name the achievement.");
      return;
    }
    await upsertAchievement({
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      threshold: Number(form.threshold) || 1,
    });
    toast.success("Achievement saved.");
    setOpen(false);
  };

  return (
    <div className="hero-wash -m-6 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <PageHeader
        eyebrow="Motivation"
        title="Achievements"
        description="Rules such as complete 3 trainings, train 3 hours in a day, or buy 3 premium programs. Unlock counts are computed from learner progress."
        actions={
          <Button
            onClick={() => {
              setForm(emptyForm());
              setOpen(true);
            }}
          >
            <Plus className="size-4" />
            New achievement
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {achievements.map((achievement) => {
          const unlocked = users.filter(
            (u) => evaluateAchievement(achievement, u, trainings, reviews).unlocked,
          ).length;
          return (
            <Card key={achievement.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <AchievementIcon name={achievement.icon} className="size-5" />
                </span>
                <Badge variant={achievement.isActive ? "accent" : "secondary"}>
                  {achievement.isActive ? "Live" : "Paused"}
                </Badge>
              </div>
              <h2 className="mt-4 font-display text-2xl leading-tight">{achievement.name}</h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{achievement.description}</p>
              <p className="mt-4 text-xs tracking-wide text-muted-foreground uppercase">
                {achievementKindLabel(achievement.kind)} · {achievement.threshold}
                {achievement.kind === "complete_category" && achievement.category
                  ? ` · ${achievement.category}`
                  : ""}
              </p>
              <p className="mt-2 text-sm tabular-nums">
                {unlocked} of {users.length} learners unlocked
              </p>
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setForm(achievement);
                    setOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => setPending(achievement.id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {achievements.length === 0 ? (
        <div className="mt-6">
          <Card className="flex flex-col items-center p-10 text-center">
            <Trophy className="size-8 text-muted-foreground" />
            <p className="mt-3 font-display text-xl">No achievements yet</p>
          </Card>
        </div>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {achievements.some((a) => a.id === form.id) ? "Edit achievement" : "New achievement"}
            </DialogTitle>
            <DialogDescription>
              Define a rule. The console evaluates it against learner progress.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="ach-name">Name</Label>
              <Input
                id="ach-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Triple Threat"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ach-desc">Description</Label>
              <Textarea
                id="ach-desc"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Complete 3 trainings."
              />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2">
                {ACHIEVEMENT_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setForm({ ...form, icon })}
                    className={`flex size-10 items-center justify-center rounded-lg border transition-[background-color,border-color] duration-150 ${
                      form.icon === icon
                        ? "border-accent bg-accent/15 text-accent"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                    aria-label={icon}
                  >
                    <AchievementIcon name={icon} className="size-4" />
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Rule</Label>
                <Select
                  value={form.kind}
                  onValueChange={(value) =>
                    setForm({
                      ...form,
                      kind: value as AchievementRecord["kind"],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACHIEVEMENT_KINDS.map((kind) => (
                      <SelectItem key={kind} value={kind}>
                        {achievementKindLabel(kind)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="threshold">Threshold</Label>
                <Input
                  id="threshold"
                  type="number"
                  min={1}
                  value={form.threshold}
                  onChange={(e) => setForm({ ...form, threshold: Number(e.target.value) || 1 })}
                />
              </div>
            </div>
            {form.kind === "complete_category" ? (
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) => setForm({ ...form, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pick a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRAINING_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            <div className="flex items-center justify-between rounded-xl bg-secondary px-3 py-3">
              <Label htmlFor="active">Active</Label>
              <Switch
                id="active"
                checked={form.isActive}
                onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void save()}>Save achievement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={Boolean(pending)}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
        title="Delete this achievement?"
        description="Learners keep their history, but this badge will no longer appear in the console."
        onConfirm={() => {
          if (!pending) return;
          void removeAchievement(pending).then(() => toast.success("Achievement removed."));
          setPending(null);
        }}
      />
    </div>
  );
}
