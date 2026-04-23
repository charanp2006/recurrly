/**
 * Subscriptions Stack Layout
 *
 * Purpose:
 * - Protects nested subscription detail routes behind auth checks
 * - Shares header configuration for nested subscription screens
 */
import { useAuth } from "@/context/AuthContext";
import { Redirect, Stack } from "expo-router";

/**
 * Guards subscription stack routes and redirects signed-out users.
 */
export default function SubscriptionLayout() {
  const { isLoading, isSignedIn } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
