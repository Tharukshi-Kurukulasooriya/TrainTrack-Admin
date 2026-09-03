import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { LearnerDialog } from "@/components/users/learner-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/hooks/useAppStore";
import type { UserRecord } from "@/lib/types";
import { formatHours, initials, resolveAvatarUrl } from "@/lib/utils";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { useAuthStore } from "@/lib/authStore";

export const Route = createFileRoute("/users/")({
  component: UsersPage,
});

function UsersPage() {
  const ready = useAppStore((s) => s.ready);
  const users = useAppStore((s) => s.users);
  const removeUser = useAppStore((s) => s.removeUser);
  const isModerator = useAuthStore((s) => s.currentAdmin?.role === "moderator");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.uid.toLowerCase().includes(q),
    );
  }, [users, search]);

  if (!ready) return <PageSkeleton cards={6} />;

  return (
    <div className="hero-wash -m-6 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <PageHeader
        eyebrow="Roster"
        title="Employees"
        description="Profiles, progress, watchlist, and activity across the training platform."
        actions={
          !isModerator ? (
            <Button
              onClick={() => {
                setEditingUser(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="size-4" />
              Add learner
            </Button>
          ) : null
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter employees by name or email…"
          className="pl-9"
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((u) => {
          const progressArr = Object.values(u.trainingProgress);
          const completedCount = progressArr.filter((p) => p.completed).length;
          const totalMins = progressArr.reduce((s, p) => s + p.minutesSpent, 0);

          return (
            <Card key={u.uid} className="flex flex-col p-5">
              <div className="flex items-start gap-4">
                <Avatar className="size-18 border border-border/80 overflow-hidden shrink-0">
                  {u.photoUrl ? (
                    <AvatarImage
                      src={resolveAvatarUrl(u.photoUrl)}
                      alt=""
                      className="object-cover"
                    />
                  ) : null}
                  <AvatarFallback className="text-2xl font-bold bg-accent/10 text-accent">
                    {initials(u.username || u.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-display text-xl leading-tight">
                    <Link to="/users/$id" params={{ id: u.uid }} className="hover:underline">
                      {u.username || "Unnamed learner"}
                    </Link>
                  </h2>
                  <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {u.isBanned ? (
                      <Badge variant="destructive" className="text-[11px] font-semibold">
                        Banned
                      </Badge>
                    ) : u.timeoutUntil && new Date(u.timeoutUntil) > new Date() ? (
                      <Badge
                        variant="outline"
                        className="text-[11px] border-amber-500/30 text-amber-500 bg-amber-500/10 font-semibold"
                      >
                        Timeout
                      </Badge>
                    ) : null}
                    <Badge variant="secondary">{completedCount} complete</Badge>
                    <Badge variant="outline">{formatHours(totalMins)}</Badge>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-2 border-t border-border/60 pt-4">
                <Button size="sm" variant="outline" asChild className="flex-1">
                  <Link to="/users/$id" params={{ id: u.uid }}>
                    View detail
                  </Link>
                </Button>
                {!isModerator ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingUser(u);
                      setDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                ) : null}
                {!isModerator ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => setPendingDelete(u.uid)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </div>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <Card className="mt-6 flex flex-col items-center p-12 text-center">
          <Users className="size-10 text-muted-foreground" />
          <p className="mt-4 font-display text-2xl">No employees found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {search
              ? "Try relaxing your search query."
              : "Click 'Add Employee' above to register your first employee."}
          </p>
        </Card>
      ) : null}

      <LearnerDialog open={dialogOpen} onOpenChange={setDialogOpen} initial={editingUser} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Remove employee?"
        description="This removes the employee profile from the console and Firestore database."
        onConfirm={() => {
          if (!pendingDelete) return;
          void removeUser(pendingDelete).then(() => toast.success("Employee profile removed."));
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
