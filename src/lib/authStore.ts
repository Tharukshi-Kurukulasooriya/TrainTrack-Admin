import { create } from "zustand";
import type { AdminRecord } from "@/lib/types";
import {
  deleteAdmin as serviceDeleteAdmin,
  fetchAdmins,
  saveAdmin as serviceSaveAdmin,
} from "@/lib/services/adminService";

const STORAGE_ACTIVE_ID_KEY = "traintrack_active_admin_id";
const STORAGE_ADMINS_KEY = "traintrack_local_admins";

function getStoredAdmins(): AdminRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_ADMINS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // fallback
  }
  return [];
}

function getStoredActiveAdmin(admins: AdminRecord[]): AdminRecord | null {
  if (typeof window === "undefined") return null;
  const storedId = localStorage.getItem(STORAGE_ACTIVE_ID_KEY);
  if (storedId) {
    const found = admins.find((a) => a.id === storedId && a.isActive);
    if (found) return found;
  }
  return null;
}

type AuthStore = {
  admins: AdminRecord[];
  currentAdmin: AdminRecord | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  loadAdmins: () => Promise<void>;
  login: (
    email: string,
    password: string,
  ) => { success: boolean; error?: string; admin?: AdminRecord };
  createFirstSuperAdmin: (
    name: string,
    email: string,
    password: string,
  ) => Promise<AdminRecord>;
  logout: () => void;
  upsertAdmin: (admin: AdminRecord) => Promise<void>;
  removeAdmin: (id: string) => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set, get) => {
  const initialAdmins = getStoredAdmins();
  const initialActiveAdmin = getStoredActiveAdmin(initialAdmins);

  return {
    admins: initialAdmins,
    currentAdmin: initialActiveAdmin,
    isAuthenticated: Boolean(initialActiveAdmin),
    isHydrated: false,

    loadAdmins: async () => {
      try {
        const fetched = await fetchAdmins();
        const activeId = localStorage.getItem(STORAGE_ACTIVE_ID_KEY);
        let activeAdmin = fetched.find((a) => a.id === activeId && a.isActive) ?? null;

        if (!activeAdmin && get().currentAdmin) {
          activeAdmin = fetched.find((a) => a.id === get().currentAdmin?.id) ?? null;
        }

        set({
          admins: fetched,
          currentAdmin: activeAdmin,
          isAuthenticated: Boolean(activeAdmin),
          isHydrated: true,
        });

        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_ADMINS_KEY, JSON.stringify(fetched));
        }
      } catch (error) {
        console.error("Failed to load admins from database", error);
        set({ isHydrated: true });
      }
    },

    login: (email: string, password: string) => {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedPassword = password.trim();

      const admin = get().admins.find(
        (a) => a.email.toLowerCase() === trimmedEmail,
      );

      if (!admin) {
        return {
          success: false,
          error: "No admin account found with this email address.",
        };
      }

      if (!admin.isActive) {
        return {
          success: false,
          error: "This admin account has been deactivated. Contact a Super Admin.",
        };
      }

      if (admin.password && admin.password !== trimmedPassword) {
        return {
          success: false,
          error: "Incorrect password. Please try again.",
        };
      }

      const updatedAdmin: AdminRecord = {
        ...admin,
        lastLoginAt: new Date().toISOString(),
      };

      const nextAdmins = get().admins.map((a) => (a.id === admin.id ? updatedAdmin : a));

      set({
        admins: nextAdmins,
        currentAdmin: updatedAdmin,
        isAuthenticated: true,
      });

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_ACTIVE_ID_KEY, updatedAdmin.id);
        localStorage.setItem(STORAGE_ADMINS_KEY, JSON.stringify(nextAdmins));
      }

      void serviceSaveAdmin(updatedAdmin);

      return { success: true, admin: updatedAdmin };
    },

    createFirstSuperAdmin: async (name: string, email: string, password: string) => {
      const newAdmin: AdminRecord = {
        id: `adm-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        role: "super_admin",
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        isActive: true,
      };

      const nextAdmins = [newAdmin, ...get().admins];

      set({
        admins: nextAdmins,
        currentAdmin: newAdmin,
        isAuthenticated: true,
      });

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_ACTIVE_ID_KEY, newAdmin.id);
        localStorage.setItem(STORAGE_ADMINS_KEY, JSON.stringify(nextAdmins));
      }

      await serviceSaveAdmin(newAdmin);
      return newAdmin;
    },

    logout: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_ACTIVE_ID_KEY);
      }
      set({
        currentAdmin: null,
        isAuthenticated: false,
      });
    },

    upsertAdmin: async (admin: AdminRecord) => {
      const existing = get().admins.find((a) => a.id === admin.id);
      const nextAdmins = existing
        ? get().admins.map((a) => (a.id === admin.id ? admin : a))
        : [admin, ...get().admins];

      const current = get().currentAdmin;
      const nextCurrent = current && current.id === admin.id ? admin : current;

      set({
        admins: nextAdmins,
        currentAdmin: nextCurrent,
      });

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_ADMINS_KEY, JSON.stringify(nextAdmins));
      }

      await serviceSaveAdmin(admin);
    },

    removeAdmin: async (id: string) => {
      const nextAdmins = get().admins.filter((a) => a.id !== id);
      const current = get().currentAdmin;

      set({
        admins: nextAdmins,
        currentAdmin: current?.id === id ? null : current,
        isAuthenticated: current?.id === id ? false : get().isAuthenticated,
      });

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_ADMINS_KEY, JSON.stringify(nextAdmins));
        if (current?.id === id) {
          localStorage.removeItem(STORAGE_ACTIVE_ID_KEY);
        }
      }

      await serviceDeleteAdmin(id);
    },
  };
});
