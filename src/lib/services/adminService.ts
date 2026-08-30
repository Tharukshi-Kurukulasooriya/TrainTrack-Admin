import { collection, deleteDoc, doc, getDocs, setDoc, Timestamp } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import type { AdminRecord, AdminRole } from "@/lib/types";

export const INBUILT_AVATARS = [
  { id: "default", name: "Default", path: "/assets/avatars/default.png" },
  { id: "man", name: "Executive Man", path: "/assets/avatars/man.png" },
  { id: "gent", name: "Gentleman", path: "/assets/avatars/gent.png" },
  { id: "lady", name: "Lady", path: "/assets/avatars/lady.png" },
  { id: "dame", name: "Dame", path: "/assets/avatars/dame.png" },
  { id: "gal", name: "Gal", path: "/assets/avatars/gal.png" },
  { id: "miss", name: "Miss", path: "/assets/avatars/miss.png" },
  { id: "youth", name: "Youth", path: "/assets/avatars/youth.png" },
  { id: "lad", name: "Lad", path: "/assets/avatars/lad.png" },
  { id: "elder", name: "Elder", path: "/assets/avatars/elder.png" },
  { id: "granny", name: "Granny", path: "/assets/avatars/granny.png" },
  { id: "kid", name: "Kid", path: "/assets/avatars/kid.png" },
  { id: "tot", name: "Tot", path: "/assets/avatars/tot.png" },
];

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asBool(value: unknown, fallback = true): boolean {
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

function mapAdmin(id: string, data: Record<string, unknown>): AdminRecord {
  const roleStr = asString(data.role, "admin");
  const role: AdminRole =
    roleStr === "super_admin" || roleStr === "moderator" ? roleStr : "admin";

  return {
    id,
    name: asString(data.name, "Admin User"),
    email: asString(data.email),
    password: asString(data.password),
    role,
    avatarUrl: asString(data.avatarUrl),
    createdAt: data.createdAt ? asIso(data.createdAt) : new Date().toISOString(),
    lastLoginAt: data.lastLoginAt ? asIso(data.lastLoginAt) : null,
    isActive: asBool(data.isActive, true),
  };
}

export async function fetchAdmins(): Promise<AdminRecord[]> {
  const fb = getFirebase();
  if (!fb) return [];
  try {
    const snap = await getDocs(collection(fb.db, "admins"));
    if (snap.empty) {
      return [];
    }
    return snap.docs.map((d) => mapAdmin(d.id, d.data() as Record<string, unknown>));
  } catch (error) {
    console.error("Failed to fetch admins from Firestore. Ensure security rules allow read access to /admins collection:", error);
    return [];
  }
}

export async function saveAdmin(admin: AdminRecord): Promise<void> {
  const fb = getFirebase();
  if (!fb) return;
  try {
    await setDoc(
      doc(fb.db, "admins", admin.id),
      {
        name: admin.name,
        email: admin.email,
        password: admin.password || "",
        role: admin.role,
        avatarUrl: admin.avatarUrl || "",
        createdAt: admin.createdAt,
        lastLoginAt: admin.lastLoginAt ? Timestamp.fromDate(new Date(admin.lastLoginAt)) : null,
        isActive: admin.isActive,
      },
      { merge: true },
    );
    console.log("Successfully saved admin to Firestore:", admin.id);
  } catch (error) {
    console.error("Failed to save admin to Firestore. Ensure security rules match /admins/{adminId}:", error);
    throw error;
  }
}

export async function deleteAdmin(id: string): Promise<void> {
  const fb = getFirebase();
  if (!fb) return;
  try {
    await deleteDoc(doc(fb.db, "admins", id));
    console.log("Successfully deleted admin from Firestore:", id);
  } catch (error) {
    console.error("Failed to delete admin from Firestore:", error);
    throw error;
  }
}

export function roleLabel(role: AdminRole): string {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "admin":
      return "Administrator";
    case "moderator":
      return "Content Moderator";
  }
}

export function roleDescription(role: AdminRole): string {
  switch (role) {
    case "super_admin":
      return "Full access to manage admin accounts, catalog, learners, and system configuration.";
    case "admin":
      return "Can manage training catalog, learners, achievements, and review content.";
    case "moderator":
      return "Can review feedback, manage reported issues, and view learner profiles.";
  }
}
