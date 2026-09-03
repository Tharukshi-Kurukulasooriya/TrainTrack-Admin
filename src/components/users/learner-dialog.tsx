import { useEffect, useState } from "react";
import {
  Bookmark,
  Clock,
  Crown,
  ShieldAlert,
  ShoppingBag,
  Upload,
  UserCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/lib/data/store";
import { useAuthStore } from "@/lib/authStore";
import { INBUILT_AVATARS } from "@/lib/services/adminService";
import type { TrainingProgress, UserRecord } from "@/lib/types";
import { initials, resolveAvatarUrl, slugify } from "@/lib/utils";

function emptyUser(): UserRecord {
  return {
    uid: `usr-${crypto.randomUUID().slice(0, 8)}`,
    username: "",
    email: "",
    photoUrl: "",
    watchlist: [],
    purchasedTrainings: [],
    trainingProgress: {},
    studyGoalMinutes: 15,
    createdAt: new Date().toISOString(),
    source: "workspace",
    isBanned: false,
    bannedReason: "",
    timeoutUntil: null,
  };
}

export function LearnerDialog({
  open,
  onOpenChange,
  initial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: UserRecord | null;
}) {
  const upsertUser = useAppStore((s) => s.upsertUser);
  const trainings = useAppStore((s) => s.trainings);
  const isAdministrator = useAuthStore((s) => s.currentAdmin?.role === "admin");

  const [form, setForm] = useState<UserRecord>(initial ? { ...initial } : emptyUser());
  const [timeoutPreset, setTimeoutPreset] = useState<string>(() => {
    if (initial?.timeoutUntil && new Date(initial.timeoutUntil) > new Date()) {
      return "custom";
    }
    return "none";
  });

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : emptyUser());
      if (initial?.timeoutUntil && new Date(initial.timeoutUntil) > new Date()) {
        setTimeoutPreset("custom");
      } else {
        setTimeoutPreset("none");
      }
    }
  }, [open, initial]);

  const isEdit = Boolean(initial);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast.error("Image file size must be under 3MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setForm((prev) => ({ ...prev, photoUrl: result }));
        toast.success("Profile image loaded successfully.");
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleWatchlist = (trainingId: string) => {
    setForm((prev) => {
      const exists = prev.watchlist.includes(trainingId);
      return {
        ...prev,
        watchlist: exists
          ? prev.watchlist.filter((id) => id !== trainingId)
          : [...prev.watchlist, trainingId],
      };
    });
  };

  const togglePurchased = (trainingId: string) => {
    setForm((prev) => {
      const exists = prev.purchasedTrainings.includes(trainingId);
      return {
        ...prev,
        purchasedTrainings: exists
          ? prev.purchasedTrainings.filter((id) => id !== trainingId)
          : [...prev.purchasedTrainings, trainingId],
      };
    });
  };

  const toggleTrainingCompleted = (
    trainingId: string,
    trainingName: string,
    totalSteps: number,
  ) => {
    setForm((prev) => {
      const current = prev.trainingProgress[trainingId];
      const isCompleted = current?.completed ?? false;
      const nextProgress: Record<string, TrainingProgress> = { ...prev.trainingProgress };

      if (isCompleted) {
        nextProgress[trainingId] = {
          trainingId,
          trainingName,
          currentStep: 0,
          totalSteps: totalSteps || 5,
          minutesSpent: Math.max(0, (current?.minutesSpent ?? 30) - 30),
          completed: false,
          lastActivityAt: new Date().toISOString(),
        };
      } else {
        nextProgress[trainingId] = {
          trainingId,
          trainingName,
          currentStep: totalSteps || 5,
          totalSteps: totalSteps || 5,
          minutesSpent: (current?.minutesSpent ?? 0) + 45,
          completed: true,
          lastActivityAt: new Date().toISOString(),
        };
      }

      return {
        ...prev,
        trainingProgress: nextProgress,
      };
    });
  };

  const handleTimeoutSelection = (duration: string) => {
    setTimeoutPreset(duration);
    if (duration === "none") {
      setForm((prev) => ({ ...prev, timeoutUntil: null }));
      return;
    }
    const now = new Date();
    let hours = 24;
    if (duration === "24h") hours = 24;
    if (duration === "3d") hours = 72;
    if (duration === "7d") hours = 168;
    if (duration === "30d") hours = 720;

    const timeoutDate = new Date(now.getTime() + hours * 60 * 60 * 1000);
    setForm((prev) => ({ ...prev, timeoutUntil: timeoutDate.toISOString() }));
  };

  const save = async () => {
    if (!form.username.trim()) {
      toast.error("Name the employee.");
      return;
    }
    const uid = isEdit
      ? form.uid
      : `usr-${slugify(form.username).toLowerCase() || crypto.randomUUID().slice(0, 8)}`;
    await upsertUser({
      ...form,
      purchasedTrainings: isAdministrator
        ? (initial?.purchasedTrainings ?? [])
        : form.purchasedTrainings,
      trainingProgress: isAdministrator ? (initial?.trainingProgress ?? {}) : form.trainingProgress,
      uid,
      username: form.username.trim(),
      email: form.email.trim(),
      createdAt: form.createdAt || new Date().toISOString(),
    });
    toast.success(isEdit ? "Employee updated successfully." : "Employee added successfully.");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Employee Profile" : "Add New Employee"}</DialogTitle>
          <DialogDescription>
            Configure profile credentials, avatar picture, account status, watchlist, and training
            progress.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="mt-2">
          <TabsList className="grid w-full grid-cols-4 bg-background">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="status">Status & Access</TabsTrigger>
            <TabsTrigger value="catalog">Catalog</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          {/* tab 1: profile */}
          <TabsContent value="profile" className="space-y-4 pt-4">
            {/* avatar section */}
            <div className="space-y-3 rounded-lg border border-border/80 bg-accent/4 p-4">
              <Label className="text-xs font-semibold tracking-wider text-muted-foreground flex items-center gap-1.5">
                Employee Profile Picture
              </Label>

              <div className="flex items-center gap-4">
                <Avatar className="size-15 border border-border shadow-sm overflow-hidden shrink-0">
                  <AvatarImage
                    src={resolveAvatarUrl(form.photoUrl)}
                    alt="Preview"
                    className="object-cover"
                  />
                  <AvatarFallback className="font-bold text-xl bg-accent/20 text-accent">
                    {initials(form.username || form.email || "Employee")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 rounded-md bg-accent/80 px-3 py-1.5 text-xs font-semibold text-accent-foreground shadow-sm hover:bg-accent/90 cursor-pointer transition-all">
                      <Upload className="size-3.5" />
                      Choose File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    {form.photoUrl ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-xs h-8 px-2 text-muted-foreground hover:text-destructive hover:bg-transparent"
                        onClick={() => setForm((prev) => ({ ...prev, photoUrl: "" }))}
                      >
                        <X className="size-3.5" />
                        Remove
                      </Button>
                    ) : null}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Upload a custom picture or choose from the avatar presets below.
                  </p>
                </div>
              </div>

              {/* avatars gallery */}
              <div className="pt-3 border-t border-border/60">
                <p className="text-[12px] font-semibold text-muted-foreground tracking-wider mb-2.5">
                  Or choose an inbuilt avatar
                </p>
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
                  {INBUILT_AVATARS.map((av) => {
                    const isSelected = form.photoUrl === av.path;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, photoUrl: av.path }))}
                        title={av.name}
                        className={`relative size-10 rounded-full border-2 overflow-hidden transition-all duration-150 ${
                          isSelected
                            ? "border-accent ring-1 ring-accent/50 scale-105"
                            : "border-border/60 hover:border-accent/60 opacity-80 hover:opacity-100"
                        }`}
                      >
                        <img src={av.path} alt={av.name} className="size-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="learner-username">Username</Label>
              <Input
                id="learner-username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder={isEdit ? initial?.username : "Enter employee username"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="learner-email">Email Address</Label>
              <Input
                id="learner-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder={isEdit ? initial?.email : "Enter employee email"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="learner-goal">Daily Study Goal (minutes)</Label>
              <Input
                id="learner-goal"
                type="number"
                min={1}
                value={form.studyGoalMinutes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    studyGoalMinutes: Number(e.target.value) || 15,
                  })
                }
                placeholder="15"
              />
            </div>
          </TabsContent>

          {/* tab 2: status & access */}
          <TabsContent value="status" className="space-y-4 pt-4">
            {/* account status overview */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border bg-card/50 p-3.5 shadow-sm">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Account Status
                </p>
                <p className="text-xs text-muted-foreground/80">
                  Current platform standing & moderation state
                </p>
              </div>

              <div className="flex items-center gap-2">
                {form.isBanned ? (
                  <Badge variant="destructive" className="gap-1.5 px-2.5 py-1 text-xs font-medium">
                    <ShieldAlert className="size-3.5" />
                    <span>Banned / Suspended</span>
                  </Badge>
                ) : form.timeoutUntil && new Date(form.timeoutUntil) > new Date() ? (
                  <Badge
                    variant="outline"
                    className="gap-1.5 border-none bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400"
                  >
                    <Clock className="size-3.5" />
                    <span>
                      Timeout active until {new Date(form.timeoutUntil).toLocaleDateString()}
                    </span>
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="gap-1.5 border-none bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                  >
                    <UserCheck className="size-3.5" />
                    <span>Active & Eligible</span>
                  </Badge>
                )}
              </div>
            </div>

            {/* ban switch */}
            <div className="space-y-3 rounded-lg border border-destructive-background/30 bg-destructive-background/10 p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="ban-switch"
                    className="font-semibold text-destructive flex items-center gap-2"
                  >
                    <ShieldAlert className="size-4" />
                    Ban / Suspend Account
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Restricts the employee from accessing training programs and logging into the
                    portal.
                  </p>
                </div>
                <Switch
                  id="ban-switch"
                  checked={Boolean(form.isBanned)}
                  onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isBanned: checked }))}
                />
              </div>

              {form.isBanned ? (
                <div className="space-y-2 pt-2 border-t border-destructive/20">
                  <Label htmlFor="ban-reason" className="text-xs">
                    Reason for Ban / Suspension
                  </Label>
                  <Input
                    id="ban-reason"
                    placeholder="e.g. Violation of compliance policies or unauthorized activity"
                    value={form.bannedReason || ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, bannedReason: e.target.value }))}
                  />
                </div>
              ) : null}
            </div>

            {/* timeout settings */}
            <div className="space-y-3 rounded-lg border border-amber-500/10 bg-amber-500/5 p-4">
              <div className="space-y-1">
                <Label className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <Clock className="size-4" />
                  Temporary Timeout
                </Label>
                <p className="text-xs text-muted-foreground">
                  Temporarily pause employee activity for a set duration.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Timeout Duration</Label>
                <Select
                  value={
                    !form.timeoutUntil || new Date(form.timeoutUntil) <= new Date()
                      ? "none"
                      : timeoutPreset
                  }
                  onValueChange={handleTimeoutSelection}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeout duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No active timeout (Normal)</SelectItem>
                    <SelectItem value="24h">24 Hours Timeout</SelectItem>
                    <SelectItem value="3d">3 Days Timeout</SelectItem>
                    <SelectItem value="7d">7 Days Timeout</SelectItem>
                    <SelectItem value="30d">30 Days Timeout</SelectItem>
                    {timeoutPreset === "custom" && (
                      <SelectItem value="custom">Active Timeout (Custom)</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {form.timeoutUntil && new Date(form.timeoutUntil) > new Date() ? (
                <div className="flex items-center justify-between text-xs">
                  <div className="gap-2 flex">
                    <span className="text-muted-foreground">Timeout expires:</span>
                    <span className="font-medium text-foreground">
                      {new Date(form.timeoutUntil).toLocaleString()}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:bg-destructive-background/80"
                    onClick={() => {
                      setTimeoutPreset("none");
                      setForm((prev) => ({ ...prev, timeoutUntil: null }));
                    }}
                  >
                    Clear Timeout
                  </Button>
                </div>
              ) : null}
            </div>
          </TabsContent>

          {/* tab 3: catalog & enrolments */}
          <TabsContent value="catalog" className="space-y-4 pt-4">
            {/* watchlist management */}
            <div className="space-y-3 rounded-lg border border-border p-4 bg-accent/4">
              <div className="flex items-center gap-2">
                <Bookmark className="size-4 text-accent" />
                <Label className="font-semibold">
                  Watchlist Programs ({form.watchlist.length})
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Toggle programs saved to the employee's watchlist.
              </p>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {trainings.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No catalog programs available.</p>
                ) : (
                  trainings.map((t) => {
                    const isSaved = form.watchlist.includes(t.id);
                    return (
                      <div
                        className={`flex items-center justify-between p-2.5 rounded-md border cursor-pointer transition-all ${
                          isSaved
                            ? "border-accent/30 bg-accent/10"
                            : "border-border/50 hover:bg-accent/5"
                        }`}
                      >
                        <span className="text-sm font-medium truncate">{t.trainingName}</span>
                        <Switch checked={isSaved} onCheckedChange={() => toggleWatchlist(t.id)} />
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* purchased trainings management */}
            <fieldset
              disabled={isAdministrator}
              className="space-y-3 rounded-lg border border-border p-4 bg-accent/4"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="size-4 text-accent" />
                <Label className="font-semibold">
                  Purchased / Unlocked Programs ({form.purchasedTrainings.length})
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Grant or revoke paid access to premium programs for this employee seat.
              </p>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {trainings.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No catalog programs available.</p>
                ) : (
                  trainings.map((t) => {
                    const isPurchased = form.purchasedTrainings.includes(t.id);
                    return (
                      <div
                        className={`flex items-center justify-between p-2.5 rounded-md border cursor-pointer transition-all ${
                          isPurchased
                            ? t.trainingIsPremium
                              ? "border-amber-500/20 bg-amber-500/10"
                              : "border-accent/30 bg-accent/10"
                            : t.trainingIsPremium
                              ? "border-border/50 hover:bg-amber-500/6"
                              : "border-border/50 hover:bg-accent/5"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-sm font-medium truncate">{t.trainingName}</span>
                          {t.trainingIsPremium ? (
                            <Badge variant="premium" className="text-[11px] py-0 px-1.5 gap-1">
                              <Crown className="size-3" />
                              Premium
                            </Badge>
                          ) : null}
                        </div>
                        <Switch
                          checked={isPurchased}
                          className={t.trainingIsPremium ? "data-[state=checked]:bg-amber-600" : ""}
                          onCheckedChange={() => togglePurchased(t.id)}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </fieldset>
          </TabsContent>

          {/* tab 4: training progress */}
          <TabsContent value="progress" className="space-y-4 pt-4">
            <fieldset disabled={isAdministrator} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold flex items-center gap-2">
                    Program Completion & Module Progress
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Manage completed status and step counters for all enrolled training programs.
                </p>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {trainings.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No catalog programs available.</p>
                ) : (
                  trainings.map((t) => {
                    const prog = form.trainingProgress[t.id];
                    const isCompleted = prog?.completed ?? false;
                    const totalSteps = t.modules.length || 5;

                    return (
                      <div
                        key={t.id}
                        className="rounded-lg border border-border/80 p-3.5 bg-accent/4 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold">{t.trainingName}</p>
                            <p className="text-xs text-muted-foreground">
                              {prog
                                ? `Step ${prog.currentStep} of ${prog.totalSteps} · ${prog.minutesSpent} mins spent`
                                : "Not started yet"}
                            </p>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant={isCompleted ? "outline" : "default"}
                            onClick={() =>
                              toggleTrainingCompleted(t.id, t.trainingName, totalSteps)
                            }
                            className="text-xs h-8"
                          >
                            {isCompleted ? "Mark Incomplete" : "Mark Complete"}
                          </Button>
                        </div>

                        {prog ? (
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
                            <div className="space-y-1">
                              <Label className="text-[11px] text-muted-foreground">
                                Completed Step
                              </Label>
                              <Input
                                type="number"
                                min={0}
                                max={prog.totalSteps}
                                value={prog.currentStep}
                                onChange={(e) => {
                                  const step = Number(e.target.value) || 0;
                                  setForm((prev) => ({
                                    ...prev,
                                    trainingProgress: {
                                      ...prev.trainingProgress,
                                      [t.id]: {
                                        ...prog,
                                        currentStep: step,
                                        completed: step >= prog.totalSteps,
                                      },
                                    },
                                  }));
                                }}
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[11px] text-muted-foreground">
                                Minutes Spent
                              </Label>
                              <Input
                                type="number"
                                min={0}
                                value={prog.minutesSpent}
                                onChange={(e) => {
                                  const mins = Number(e.target.value) || 0;
                                  setForm((prev) => ({
                                    ...prev,
                                    trainingProgress: {
                                      ...prev.trainingProgress,
                                      [t.id]: {
                                        ...prog,
                                        minutesSpent: mins,
                                      },
                                    },
                                  }));
                                }}
                                className="h-8 text-xs"
                              />
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>
            </fieldset>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4 pt-3 border-t border-border/60">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => void save()}>{isEdit ? "Save Changes" : "Add Employee"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
