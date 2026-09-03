import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, Timestamp } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import type { UserRecord } from "@/lib/types";

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function asBool(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item));
}

function asIso(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (typeof value === "string") return value;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "object" && value !== null && "toDate" in value) {
    try {
      return (value as Timestamp).toDate().toISOString();
    } catch {
      return new Date().toISOString();
    }
  }
  return new Date().toISOString();
}

function mapUser(uid: string, data: Record<string, unknown>): UserRecord {
  const rawProgress = (data.trainingProgress as Record<string, Record<string, unknown>>) ?? {};
  const trainingProgress: UserRecord["trainingProgress"] = {};
  for (const [id, value] of Object.entries(rawProgress)) {
    if (!value || typeof value !== "object") continue;
    trainingProgress[id] = {
      trainingId: id,
      trainingName: asString(value.trainingName),
      currentStep: asNumber(value.currentStep),
      totalSteps: asNumber(value.totalSteps),
      minutesSpent: asNumber(value.minutesSpent),
      completed: asBool(value.completed),
      lastActivityAt: value.lastActivityAt ? asIso(value.lastActivityAt) : null,
    };
  }
  return {
    uid,
    username: asString(data.username),
    email: asString(data.email),
    photoUrl: asString(data.photoUrl),
    watchlist: asStringArray(data.watchlist),
    purchasedTrainings: asStringArray(data.purchasedTrainings),
    trainingProgress,
    studyGoalMinutes: asNumber(data.studyGoalMinutes, 15),
    createdAt: asIso(data.createdAt),
    source: "firebase",
    isBanned: asBool(data.isBanned, false),
    bannedReason: asString(data.bannedReason),
    timeoutUntil: data.timeoutUntil ? asIso(data.timeoutUntil) : null,
  };
}

export async function fetchUsers(): Promise<UserRecord[]> {
  const fb = getFirebase();
  if (!fb) return [];
  const snap = await getDocs(collection(fb.db, "users"));
  return snap.docs.map((d) => mapUser(d.id, d.data() as Record<string, unknown>));
}

export async function fetchUserById(uid: string): Promise<UserRecord | null> {
  const fb = getFirebase();
  if (!fb) return null;
  const snap = await getDoc(doc(fb.db, "users", uid));
  if (!snap.exists()) return null;
  return mapUser(snap.id, snap.data() as Record<string, unknown>);
}

export async function saveUser(user: UserRecord): Promise<void> {
  const fb = getFirebase();
  if (!fb) throw new Error("Firebase is not available");
  const progress: Record<string, unknown> = {};
  for (const [id, p] of Object.entries(user.trainingProgress)) {
    progress[id] = {
      trainingName: p.trainingName,
      currentStep: p.currentStep,
      totalSteps: p.totalSteps,
      minutesSpent: p.minutesSpent,
      completed: p.completed,
      lastActivityAt: p.lastActivityAt ? Timestamp.fromDate(new Date(p.lastActivityAt)) : null,
    };
  }
  await setDoc(
    doc(fb.db, "users", user.uid),
    {
      username: user.username,
      email: user.email,
      photoUrl: user.photoUrl,
      watchlist: user.watchlist,
      purchasedTrainings: user.purchasedTrainings,
      trainingProgress: progress,
      studyGoalMinutes: user.studyGoalMinutes,
      createdAt: user.createdAt,
      isBanned: Boolean(user.isBanned),
      bannedReason: user.bannedReason || "",
      timeoutUntil: user.timeoutUntil || null,
    },
    { merge: true },
  );
}

export async function deleteUser(uid: string): Promise<void> {
  const fb = getFirebase();
  if (!fb) throw new Error("Firebase is not available");
  await deleteDoc(doc(fb.db, "users", uid));
}
