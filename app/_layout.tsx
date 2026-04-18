/**
 * Root Layout - App Entry Point
 * 
 * Purpose:
 * - Bootstrap the application
 * - Load fonts and configure providers
 * - Manage authentication state
 * - Setup analytics (PostHog)
 * - Configure splash screen
 * 
 * Key Features:
 * - Font loading with custom typefaces
 * - Safe Area provider for notch/status bar handling
 * - Authentication context for OTP flow
 * - PostHog analytics integration
 * - Expo Router stack navigation
 * 
 * Dependencies:
 * - expo-font for custom fonts
 * - expo-splash-screen for splash handling
 * - AuthProvider for OTP authentication
 * - PostHog for analytics
 */

import { SplashScreen, Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "@/global.css";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { PostHogProvider } from "posthog-react-native";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "react-native-toast-notifications";

// Prevent splash screen from hiding automatically
SplashScreen.preventAutoHideAsync();

/**
 * Validate and retrieve PostHog configuration
 * Throws error if required environment variables are missing
 */
const getPosthogConfig = () => {
  const apiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
  const host = process.env.EXPO_PUBLIC_POSTHOG_HOST;

  console.log("[App] PostHog configuration validation...");

  if (!apiKey) {
    console.error("[App] Missing: EXPO_PUBLIC_POSTHOG_API_KEY");
    throw new Error(
      "Missing PostHog API key. Set EXPO_PUBLIC_POSTHOG_API_KEY in .env.local"
    );
  }

  if (!host) {
    console.error("[App] Missing: EXPO_PUBLIC_POSTHOG_HOST");
    throw new Error(
      "Missing PostHog host. Set EXPO_PUBLIC_POSTHOG_HOST in .env.local"
    );
  }

  console.log("[App] PostHog configuration valid");
  return { apiKey, host };
};

/**
 * Root Layout Component
 */
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
  });

  /**
   * Hide splash screen once fonts are loaded
   */
  useEffect(() => {
    if (fontsLoaded) {
      console.log("[App] Fonts loaded, hiding splash screen");
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Show splash screen while fonts load
  }

  // Get validated PostHog config (throws with clear error if invalid)
  const posthogConfig = getPosthogConfig();

  return (
    <PostHogProvider
      apiKey={posthogConfig.apiKey}
      options={{ host: posthogConfig.host }}
    >
      <AuthProvider>
        <SafeAreaProvider>
          <ToastProvider>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
          </ToastProvider>
        </SafeAreaProvider>
      </AuthProvider>
    </PostHogProvider>
  );
}

