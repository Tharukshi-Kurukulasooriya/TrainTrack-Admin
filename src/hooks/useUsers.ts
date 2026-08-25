import { useAppStore } from "@/hooks/useAppStore";

export function useUsers() {
  const users = useAppStore((s) => s.users);
  const upsertUser = useAppStore((s) => s.upsertUser);
  const removeUser = useAppStore((s) => s.removeUser);

  return {
    users,
    upsertUser,
    removeUser,
  };
}
