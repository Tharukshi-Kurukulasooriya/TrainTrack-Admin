import { create } from "zustand";

export type ThemeMode = "dark" | "light";

export type ThemeColor = "cyan" | "emerald" | "violet" | "blue" | "amber" | "rose";

export interface ThemeColorOption {
  id: ThemeColor;
  name: string;
  hex: string;
  ringClass: string;
  bgClass: string;
}

export const THEME_COLORS: ThemeColorOption[] = [
  {
    id: "cyan",
    name: "Cyan (Default)",
    hex: "#1cadb3",
    ringClass: "ring-[#1cadb3]",
    bgClass: "bg-[#1cadb3]",
  },
  {
    id: "emerald",
    name: "Emerald",
    hex: "#10b981",
    ringClass: "ring-[#10b981]",
    bgClass: "bg-[#10b981]",
  },
  {
    id: "violet",
    name: "Violet",
    hex: "#8b5cf6",
    ringClass: "ring-[#8b5cf6]",
    bgClass: "bg-[#8b5cf6]",
  },
  {
    id: "blue",
    name: "Ocean Blue",
    hex: "#3b82f6",
    ringClass: "ring-[#3b82f6]",
    bgClass: "bg-[#3b82f6]",
  },
  {
    id: "amber",
    name: "Amber Gold",
    hex: "#f59e0b",
    ringClass: "ring-[#f59e0b]",
    bgClass: "bg-[#f59e0b]",
  },
  {
    id: "rose",
    name: "Rose Pink",
    hex: "#f43f5e",
    ringClass: "ring-[#f43f5e]",
    bgClass: "bg-[#f43f5e]",
  },
];

interface ThemeState {
  mode: ThemeMode;
  themeColor: ThemeColor;
  setMode: (mode: ThemeMode) => void;
  setThemeColor: (color: ThemeColor) => void;
  toggleMode: () => void;
}

const getInitialMode = (): ThemeMode => {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem("traintrack_theme_mode");
  if (saved === "light" || saved === "dark") return saved;
  return "dark";
};

const getInitialThemeColor = (): ThemeColor => {
  if (typeof window === "undefined") return "cyan";
  const saved = localStorage.getItem("traintrack_theme_color");
  const validColors: ThemeColor[] = ["cyan", "emerald", "violet", "blue", "amber", "rose"];
  if (saved && validColors.includes(saved as ThemeColor)) return saved as ThemeColor;
  return "cyan";
};

export const applyThemeToDocument = (mode: ThemeMode, color: ThemeColor) => {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  if (mode === "light") {
    root.classList.add("light");
    root.classList.remove("dark");
  } else {
    root.classList.remove("light");
    root.classList.add("dark");
  }
  root.setAttribute("data-theme-color", color);
};

export const useThemeStore = create<ThemeState>((set) => {
  const initialMode = getInitialMode();
  const initialColor = getInitialThemeColor();

  if (typeof window !== "undefined") {
    applyThemeToDocument(initialMode, initialColor);
  }

  return {
    mode: initialMode,
    themeColor: initialColor,
    setMode: (mode) => {
      localStorage.setItem("traintrack_theme_mode", mode);
      set((state) => {
        applyThemeToDocument(mode, state.themeColor);
        return { mode };
      });
    },
    setThemeColor: (color) => {
      localStorage.setItem("traintrack_theme_color", color);
      set((state) => {
        applyThemeToDocument(state.mode, color);
        return { themeColor: color };
      });
    },
    toggleMode: () => {
      set((state) => {
        const nextMode: ThemeMode = state.mode === "dark" ? "light" : "dark";
        localStorage.setItem("traintrack_theme_mode", nextMode);
        applyThemeToDocument(nextMode, state.themeColor);
        return { mode: nextMode };
      });
    },
  };
});
