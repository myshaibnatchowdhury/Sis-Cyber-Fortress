"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { UserProfile, UserRole } from "../../../shared/types/cyber-fortress";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  roles: UserRole[];
  isSuperAdmin: boolean;
  isSecurityAdmin: boolean;
  isAuditor: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>(["standard_user"]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch profile and roles from Supabase
  const fetchUserData = async (currentUser: User) => {
    try {
      if (!isSupabaseConfigured) {
        // Safe local evaluation mode
        setProfile({
          id: currentUser.id,
          email: currentUser.email || "dev@sis-cyberfortress.internal",
          full_name: currentUser.user_metadata?.full_name || "Enterprise Security Analyst",
          avatar_url: null,
          phone_number: null,
          security_score: 92,
          mfa_enabled: false,
          is_suspended: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          roles: ["super_admin", "security_admin", "standard_user"],
        });
        setRoles(["super_admin", "security_admin", "standard_user"]);
        return;
      }

      // 1. Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      // 2. Fetch roles
      const { data: userRolesData } = await supabase
        .from("user_roles")
        .select("roles ( name )")
        .eq("user_id", currentUser.id);

      const userRoles: UserRole[] = userRolesData
        ? (userRolesData.map((r: any) => r.roles?.name).filter(Boolean) as UserRole[])
        : ["standard_user"];

      if (profileData) {
        setProfile({ ...profileData, roles: userRoles });
      }
      setRoles(userRoles.length > 0 ? userRoles : ["standard_user"]);
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Local demo / developer session setup
      const demoUser = {
        id: "00000000-0000-0000-0000-000000000001",
        email: "superadmin@sis-cyberfortress.internal",
        user_metadata: { full_name: "Super Administrator" },
      } as unknown as User;

      setUser(demoUser);
      fetchUserData(demoUser).finally(() => setIsLoading(false));
      return;
    }

    // Supabase auth subscription
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user);
      } else {
        setProfile(null);
        setRoles(["standard_user"]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      // Offline / evaluation fallback
      const mockUser = {
        id: "00000000-0000-0000-0000-000000000001",
        email,
        user_metadata: { full_name: "Security Lead" },
      } as unknown as User;
      setUser(mockUser);
      await fetchUserData(mockUser);
      return {};
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const register = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured) {
      const mockUser = {
        id: "00000000-0000-0000-0000-000000000002",
        email,
        user_metadata: { full_name: fullName },
      } as unknown as User;
      setUser(mockUser);
      await fetchUserData(mockUser);
      return {};
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    if (error) return { error: error.message };
    return {};
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setRoles(["standard_user"]);
  };

  const isSuperAdmin = roles.includes("super_admin");
  const isSecurityAdmin = isSuperAdmin || roles.includes("security_admin");
  const isAuditor = roles.includes("auditor");

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        roles,
        isSuperAdmin,
        isSecurityAdmin,
        isAuditor,
        isLoading,
        login,
        register,
        logout,
        refreshProfile: async () => {
          if (user) await fetchUserData(user);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
