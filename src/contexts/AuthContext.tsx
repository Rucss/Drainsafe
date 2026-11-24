import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { AuthContext } from "@/contexts/auth-context";
import type { SignUpResult } from "@/contexts/auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error("Unable to load Supabase session:", error);
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error("Supabase is not configured. Add the required Vite environment variables.");
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error("Supabase is not configured. Add the required Vite environment variables.");
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) throw error;
    if (data.session) return "signed_in";

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (!signInError) return "signed_in";
    if (
      signInError.code === "email_not_confirmed"
      || signInError.message.toLowerCase().includes("email not confirmed")
    ) {
      return "confirmation_required";
    }
    if (
      signInError.code === "invalid_credentials"
      || signInError.message.toLowerCase().includes("invalid login credentials")
    ) {
      return "invalid_credentials";
    }
    throw signInError;
  };

  const requestPasswordReset = async (email: string) => {
    if (!supabase) {
      throw new Error("Supabase is not configured. Add the required Vite environment variables.");
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    if (!supabase) {
      throw new Error("Supabase is not configured. Add the required Vite environment variables.");
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  };

  const signOut = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        loading,
        configured: isSupabaseConfigured,
        signIn,
        signUp,
        requestPasswordReset,
        updatePassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
