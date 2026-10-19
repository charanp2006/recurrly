/**
 * App Entry Point / Auth Gate
 * 
 * Purpose:
 * - Check authentication state
 * - Redirect to appropriate screen based on auth status
 * - Show loading state while checking auth
 * 
 * Key Features:
 * - Checks for valid token and user data
 * - Redirects to sign-in if not authenticated
 * - Redirects to main app if authenticated
 * - Shows splash screen while loading
 * 
 * Dependencies:
 * - useAuth hook from AuthContext
 * - expo-router for navigation
 */

import "@/global.css";
import { useAuth } from "@/context/AuthContext";
import { Redirect } from "expo-router";
import AppSplash from "@/components/AppSplash";
import { useEffect } from "react";

/**
 * Auth gate component that redirects users based on session state.
 */
export default function Index() {
  const { isLoading, isSignedIn } = useAuth();

  /**
   * Logs auth state transitions for app bootstrap diagnostics.
   */
  useEffect(() => {
    console.log("[Index] Auth state changed", { isSignedIn, isLoading });
  }, [isLoading, isSignedIn]);

  if (isLoading) {
    return <AppSplash showCTA={false} />;
  }

  // Redirect based on authentication status
  if (isSignedIn) {
    console.log("[Index] Redirecting to main app");
    return <Redirect href="/(tabs)" />;
  }

  console.log("[Index] Redirecting to sign-in");
  return <Redirect href="/(auth)/sign-in" />;
}
