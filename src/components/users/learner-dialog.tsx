import { useState } from "react";
import { toast } from "sonner";
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
import { useAppStore } from "@/lib/data/store";
import { slugify } from "@/lib/utils";
import type { UserRecord } from "@/lib/types";

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
    source: "workspace",
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
  const [form, setForm] = useState<UserRecord>(initial ?? emptyUser());

  const isEdit = Boolean(initial);

  const save = async () => {
    if (!form.username.trim()) {
      toast.error("Name the learner.");
      return;
    }
    const uid = isEdit
      ? form.uid
      : `usr-${slugify(form.username).toLowerCase() || crypto.randomUUID().slice(0, 8)}`;
    await upsertUser({
      ...form,
      uid,
      username: form.username.trim(),
      email: form.email.trim(),
    });
    toast.success(isEdit ? "Learner updated." : "Learner added.");
    onOpenChange(false);
    setForm(emptyUser());
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (next) setForm(initial ?? emptyUser());
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit learner" : "Add learner"}</DialogTitle>
          <DialogDescription>
            Profiles sync to Firebase when the users collection allows writes.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="learner-name">Name</Label>
            <Input
              id="learner-name"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Amelia Chen"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="learner-email">Email</Label>
            <Input
              id="learner-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="amelia@northline.co"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="learner-goal">Daily study goal (minutes)</Label>
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
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => void save()}>
            {isEdit ? "Save" : "Add learner"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
