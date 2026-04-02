import { create } from 'zustand';
import type { AppRole, Profile } from '@/types/app.types';
import { createClient } from '@/lib/supabase/client';

interface UserState {
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  role: null,
  loading: false,
  error: null,

  fetchUser: async () => {
    set({ loading: true, error: null });

    try {
      const supabase = createClient();

      // Get the authenticated user from Supabase Auth
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        set({ profile: null, role: null, loading: false, error: 'İstifadəçi tapılmadı' });
        return;
      }

      // Fetch the full profile from the profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        set({
          profile: null,
          role: null,
          loading: false,
          error: 'Profil tapılmadı',
        });
        return;
      }

      set({
        profile: profile as Profile,
        role: (profile as Profile).role,
        loading: false,
        error: null,
      });
    } catch {
      set({
        profile: null,
        role: null,
        loading: false,
        error: 'Xəta baş verdi',
      });
    }
  },

  clearUser: () => {
    set({ profile: null, role: null, loading: false, error: null });
  },
}));
