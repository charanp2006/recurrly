/**
 * Auth Group Layout
 * 
 * Purpose:
 * - Protect auth screens from signed-in users
 * - Redirect authenticated users to main app
 * - Hide navigation headers for auth screens
 */

import { useAuth } from "@/context/AuthContext";
import { Redirect, Stack } from "expo-router";
import { useEffect } from "react";

/**
 * Guards auth routes and redirects already signed-in users to tabs.
 */
export default function AuthLayout() {
  const { isLoading, isSignedIn } = useAuth();

  /**
   * Logs auth layout gate transitions for debugging route guards.
   */
  useEffect(() => {
    console.log("[AuthLayout] Auth state changed", { isSignedIn, isLoading });
  }, [isLoading, isSignedIn]);

  if (isLoading) {
    return null;
  }

  // Redirect signed-in users to main app
  if (isSignedIn) {
    console.log("[AuthLayout] User already signed in, redirecting to main app");
    return <Redirect href="/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

