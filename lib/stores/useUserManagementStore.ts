import { create } from "zustand";
import { supabase } from "@/lib/supabase/supabaseClient";
import { User, UserRole } from "@/types";
import axios from "axios";

interface UserManagementState {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  addUser: (userData: Omit<User, "id" | "joinedAt"> & { password?: string }) => Promise<boolean>;
  updateUser: (id: string, updates: Partial<User> & { password?: string }) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
}

export const useUserManagementStore = create<UserManagementState>((set, get) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("joined_at", { ascending: false });

    if (error) {
      set({ error: error.message, loading: false });
    } else {
      const formattedUsers: User[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        role: item.role as UserRole,
        avatar: item.avatar || "",
        department: item.department,
        joinedAt: item.joined_at || item.created_at,
        phone: item.phone,
      }));
      set({ users: formattedUsers, loading: false });
    }
  },

  addUser: async (userData) => {
    try {
      set({ error: null });
      
      await axios.post("/api/users", userData);

      await get().fetchUsers();
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to create user";
      set({ error: errorMessage });
      return false;
    }
  },

  updateUser: async (id, updates) => {
    try {
      set({ error: null });

      const payload: any = { ...updates };
      if (payload.joinedAt) {
        payload.joined_at = payload.joinedAt;
        delete payload.joinedAt;
      }

      await axios.patch(`/api/users/${id}`, payload);

      await get().fetchUsers();
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to update user";
      set({ error: errorMessage });
      return false;
    }
  },

  deleteUser: async (id) => {
    try {
      set({ error: null });

      // Call your backend API route to securely wipe the user from Auth and profiles
      await axios.delete(`/api/users/${id}`);

      set({ users: get().users.filter((u) => u.id !== id) });
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to delete user";
      set({ error: errorMessage });
      return false;
    }
  },
}));