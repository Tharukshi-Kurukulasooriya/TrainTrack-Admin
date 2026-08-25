import { collection, deleteDoc, doc, getDocs, setDoc, Timestamp } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import type { AchievementRecord } from "@/lib/types";

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

function mapAchievement(id: string, data: Record<string, unknown>): AchievementRecord {
  return {
    id,
    name: asString(data.name),
    description: asString(data.description),
    icon: asString(data.icon, "Award"),
    kind: (asString(data.kind, "complete_trainings") ||
      "complete_trainings") as AchievementRecord["kind"],
    threshold: asNumber(data.threshold, 1),
    category: asString(data.category),
    isActive: data.isActive === undefined ? true : asBool(data.isActive, true),
    createdAt: asIso(data.createdAt),
  };
}

export async function fetchAchievements(): Promise<AchievementRecord[]> {
  const fb = getFirebase();
  if (!fb) return [];
  const snap = await getDocs(collection(fb.db, "achievements"));
  return snap.docs.map((d) => mapAchievement(d.id, d.data() as Record<string, unknown>));
}

export async function saveAchievement(achievement: AchievementRecord): Promise<void> {
  const fb = getFirebase();
  if (!fb) throw new Error("Firebase is not available");
  await setDoc(doc(fb.db, "achievements", achievement.id), {
    name: achievement.name,
    description: achievement.description,
    icon: achievement.icon,
    kind: achievement.kind,
    threshold: achievement.threshold,
    category: achievement.category,
    isActive: achievement.isActive,
    createdAt: Timestamp.fromDate(new Date(achievement.createdAt)),
  });
}

export async function deleteAchievement(id: string): Promise<void> {
  const fb = getFirebase();
  if (!fb) throw new Error("Firebase is not available");
  await deleteDoc(doc(fb.db, "achievements", id));
}
