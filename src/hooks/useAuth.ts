"use client";

import { useAuth as useZcomAuth, useProfile } from "@zcom/storefront-kit/client";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import type { User } from "@/types";

export interface SignUpInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  countryCode?: string;
  /** Opt in to marketing email */
  acceptsMarketing?: boolean;
}

/*
 * The signed-in shopper, through the Zcom kit (session in memory, refresh cookie HttpOnly; the guest
 * bag is merged into the account at sign-in). Keeps the shape the design's components were built on.
 */
export function useAuth() {
  const router = useRouter();
  const auth = useZcomAuth();
  const { profile } = useProfile();

  const user = useMemo<User | null>(() => {
    if (!auth.isLoggedIn || !profile) return null;
    return {
      _id: profile._id,
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      email: profile.email,
      phoneNumber: profile.phoneNumber,
      countryCode: profile.countryCode,
      gender: profile.gender,
      dateOfBirth: profile.dateOfBirth,
      profileImg: profile.profileImg,
    };
  }, [auth.isLoggedIn, profile]);

  /** Throws on bad credentials — show errorMessage(error) in the form */
  async function login(email: string, password: string) {
    await auth.login(email, password);
  }

  async function signup(input: SignUpInput) {
    await auth.signup({
      email: input.email,
      password: input.password,
      firstName: input.firstName,
      lastName: input.lastName,
      phoneNumber: input.phoneNumber,
      countryCode: input.countryCode,
      acceptsMarketing: input.acceptsMarketing,
    });
  }

  async function logout() {
    // Clears the local session even when the server can't be reached
    await auth.logout();
    router.push("/home");
  }

  return {
    user,
    /** false while the session is being restored on first load — don't treat that as signed out */
    hydrated: auth.isReady,
    isLoggedIn: auth.isLoggedIn,
    login,
    signup,
    logout,
    requestPasswordReset: auth.requestPasswordReset,
  };
}
