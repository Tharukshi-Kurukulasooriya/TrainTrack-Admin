import { useMemo, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { Command } from "cmdk";
import { BookOpen, Trophy, Users } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { NAV_ITEMS } from "@/components/layout/nav";
import { useAppStore } from "@/lib/data/store";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const trainings = useAppStore((s) => s.trainings);
  const users = useAppStore((s) => s.users);
  const achievements = useAppStore((s) => s.achievements);
  const [query, setQuery] = useState("");

  const go = (to: string) => {
    onOpenChange(false);
    setQuery("");
    router.history.push(to);
  };

  const filteredTrainings = useMemo(
    () =>
      trainings
        .filter((t) =>
          `${t.trainingName} ${t.id} ${t.trainingCategory}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .slice(0, 6),
    [trainings, query],
  );

  const filteredUsers = useMemo(
    () =>
      users
        .filter((u) => `${u.username} ${u.email}`.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 6),
    [users, query],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-lg">
        <DialogTitle className="sr-only">Search command</DialogTitle>
        <Command className="bg-transparent" shouldFilter={false}>
          <Command.Input
            value={query}
            onValueChange={setQuery}
            placeholder="Jump to a training, learner, or page"
            className="h-12 w-full border-b border-border bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground"
          />
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="px-3 py-8 text-center text-sm text-muted-foreground">
              Nothing matches that search.
            </Command.Empty>
            <Command.Group heading="Pages" className="text-xs text-muted-foreground">
              {NAV_ITEMS.map((item) => (
                <Command.Item
                  key={item.to}
                  value={item.label}
                  onSelect={() => go(item.to)}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground aria-selected:bg-secondary"
                >
                  <item.icon className="size-4 text-muted-foreground" />
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>
            {filteredTrainings.length > 0 && (
              <Command.Group heading="Catalog" className="mt-2 text-xs text-muted-foreground">
                {filteredTrainings.map((training) => (
                  <Command.Item
                    key={training.id}
                    value={training.trainingName}
                    onSelect={() => go(`/trainings/${training.id}`)}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground aria-selected:bg-secondary"
                  >
                    <BookOpen className="size-4 text-muted-foreground" />
                    <span className="truncate">{training.trainingName}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
            {filteredUsers.length > 0 && (
              <Command.Group heading="Learners" className="mt-2 text-xs text-muted-foreground">
                {filteredUsers.map((user) => (
                  <Command.Item
                    key={user.uid}
                    value={user.username}
                    onSelect={() => go(`/users/${user.uid}`)}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground aria-selected:bg-secondary"
                  >
                    <Users className="size-4 text-muted-foreground" />
                    <span className="truncate">{user.username}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
            {achievements.slice(0, 4).map((achievement) => (
              <Command.Item
                key={achievement.id}
                value={achievement.name}
                onSelect={() => go("/achievements")}
                className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground aria-selected:bg-secondary"
              >
                <Trophy className="size-4 text-muted-foreground" />
                {achievement.name}
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
