import { createClient } from './supabase/client';
import { users } from './users';

const supabase = createClient();
export const auth = {
  signUp: async (email: string, password: string) => {
    const { data: existingUser, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    if (existingUser) {
      throw new Error(
        'This email is already registered. Try signing in instead.'
      );
    }

    if (error) {
      throw error;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      throw new Error('Failed to create user account');
    }

    if (!data.user) {
      throw new Error('Failed to create user account');
    }

    try {
      await users.captureUserDetails(data.user);
    } catch (profileError) {
      // If profile creation fails, clean up the auth user
      await supabase.auth.admin.deleteUser(data.user.id);
      throw profileError;
    }
  },
  login: async () => {},
  signInWithOAuth: async () => {},
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    // useAccessStore.getState().reset();
    if (error) throw { message: error.message, status: error.status };
  },
};
