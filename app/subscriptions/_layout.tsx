import { useAuth } from "@/context/AuthContext";
import { Redirect, Stack } from "expo-router";

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
