import React from "react";
import dayjs from "dayjs";
import { useClerk, useUser } from "@clerk/expo";
import { clsx } from "clsx";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import images from "@/constants/images";
import "@/global.css";

const SafeAreaView = styled(RNSafeAreaView);
const StyledScrollView = styled(ScrollView);
const StyledImage = styled(Image);

const Settings = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const fullName = user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Recurrly Member";
  const email = user?.primaryEmailAddress?.emailAddress || "No email available";
  const phone = user?.phoneNumbers?.[0]?.phoneNumber || "Not added";
  const memberSince = user?.createdAt ? dayjs(user.createdAt).format("MMMM YYYY") : "Unknown";
  const lastSignIn = user?.lastSignInAt ? dayjs(user.lastSignInAt).format("MMM DD, YYYY") : "Unknown";

  const handleSignOut = async () => {
    if (isSigningOut) {
      return;
    }

    try {
      setIsSigningOut(true);
      await signOut();
      router.replace("/(auth)/sign-in");
    } finally {
      setIsSigningOut(false);
    }
  };

  if (!isLoaded) {
    return (
      <SafeAreaView className="settings-safe-area items-center justify-center">
        <ActivityIndicator size="large" color="#081126" />
      </SafeAreaView>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <SafeAreaView className="settings-safe-area items-center justify-center px-6">
        <Text className="text-lg font-sans-semibold text-primary">You are signed out.</Text>
        <Text className="mt-2 text-center text-sm font-sans-medium text-muted-foreground">
          Please sign in again to access account settings.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="settings-safe-area">
      <StyledScrollView
        className="settings-scroll"
        contentContainerClassName="settings-content"
        showsVerticalScrollIndicator={false}
      >
        <Text className="settings-title">Settings</Text>
        <Text className="settings-subtitle">Profile and account preferences</Text>

        <View className="settings-profile-card">
          <StyledImage
            source={user.imageUrl ? { uri: user.imageUrl } : images.avatar}
            className="settings-avatar"
          />
          <View className="settings-profile-copy">
            <Text className="settings-name" numberOfLines={1}>{fullName}</Text>
            <Text className="settings-email" numberOfLines={1}>{email}</Text>
            <View className="settings-badge">
              <Text className="settings-badge-text">Active account</Text>
            </View>
          </View>
        </View>

        <View className="settings-section">
          <Text className="settings-section-title">Account details</Text>
          <View className="settings-card">
            <View className="settings-row">
              <Text className="settings-row-label">Name</Text>
              <Text className="settings-row-value">{fullName}</Text>
            </View>
            <View className="settings-row settings-row-divider">
              <Text className="settings-row-label">Email</Text>
              <Text className="settings-row-value">{email}</Text>
            </View>
            <View className="settings-row settings-row-divider">
              <Text className="settings-row-label">Phone</Text>
              <Text className="settings-row-value">{phone}</Text>
            </View>
            <View className="settings-row settings-row-divider">
              <Text className="settings-row-label">Member since</Text>
              <Text className="settings-row-value">{memberSince}</Text>
            </View>
            <View className="settings-row settings-row-divider">
              <Text className="settings-row-label">Last sign in</Text>
              <Text className="settings-row-value">{lastSignIn}</Text>
            </View>
          </View>
        </View>

        <View className="settings-section">
          <Text className="settings-section-title">Security</Text>
          <View className="settings-card">
            <View className="settings-row">
              <Text className="settings-row-label">Session status</Text>
              <Text className="settings-row-value">Signed in</Text>
            </View>
            <View className="settings-row settings-row-divider">
              <Text className="settings-row-label">Authentication</Text>
              <Text className="settings-row-value">Email and password</Text>
            </View>
          </View>
          <Text className="settings-support-copy">
            Use logout below to end the active session and retest onboarding or sign-in flows.
          </Text>
        </View>

        <Pressable
          onPress={handleSignOut}
          disabled={isSigningOut}
          className={clsx("settings-logout", isSigningOut && "settings-logout-disabled")}
        >
          {isSigningOut ? (
            <ActivityIndicator color="#fff9e3" />
          ) : (
            <Text className="settings-logout-text">Log out</Text>
          )}
        </Pressable>
      </StyledScrollView>
    </SafeAreaView>
  );
};

export default Settings;