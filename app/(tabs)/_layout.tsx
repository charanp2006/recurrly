/**
 * Tabs Group Layout
 * 
 * Purpose:
 * - Protect main app screens from unauthenticated users
 * - Render tab navigation for authenticated users
 * - Provide access to all main app features
 * 
 * Key Features:
 * - Bottom tab bar navigation
 * - Auth check with redirect to sign-in
 * - Dynamic tab icons
 * - Safe area handling for notches
 */

import { tabs } from "@/constants/data";
import { Redirect, Tabs } from "expo-router";
import { View, Image } from "react-native";
import { clsx } from "clsx";
import { useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, components } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";

const tabBar = components.tabBar;

interface TabIconProps {
  focused: boolean;
  icon: any;
}

const TabIcon = ({ focused, icon }: TabIconProps) => {
  return (
    <View className="tabs-icon">
      <View className={clsx("tabs-pill", focused && "tabs-active")}>
        <Image source={icon} resizeMode="contain" className="tabs-glyph" />
      </View>
    </View>
  );
};

const TabLayout = () => {
  const { isLoading, isSignedIn } = useAuth();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    console.log("[TabLayout] Auth state changed", { isSignedIn, isLoading });
  }, [isLoading, isSignedIn]);

  if (isLoading) {
    return null;
  }

  // Redirect unsigned-out users to sign-in
  if (!isSignedIn) {
    console.log("[TabLayout] User not signed in, redirecting to sign-in");
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: Math.max(insets.bottom, tabBar.horizontalInset),
          height: tabBar.height,
          marginHorizontal: tabBar.horizontalInset,
          borderRadius: tabBar.radius,
          backgroundColor: colors.primary,
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarItemStyle: {
          paddingVertical: tabBar.height / 2 - tabBar.iconFrame / 1.6,
        },
        tabBarIconStyle: {
          width: tabBar.iconFrame,
          height: tabBar.iconFrame,
          alignSelf: "center",
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => {
              return <TabIcon focused={focused} icon={tab.icon} />;
            },
          }}
        />
      ))}
      <Tabs.Screen
        name="subscriptions/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
};

export default TabLayout;

