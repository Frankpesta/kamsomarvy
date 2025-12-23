import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  sessionToken: string | null;
  admin: any | null;
  setSession: (token: string | null, admin: any | null) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      sessionToken: null,
      admin: null,
      setSession: (token, admin) => set({ sessionToken: token, admin }),
      clearSession: () => set({ sessionToken: null, admin: null }),
    }),
    {
      name: "auth-storage",
    }
  )
);

