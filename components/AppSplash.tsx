/**
 * App Splash Component
 * 
 * Purpose:
 * - Display branded loading state during app bootstrap
 */

import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

const AppSplash = () => {
  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <View className="h-20 w-20 items-center justify-center rounded-3xl bg-primary">
        <Text className="text-3xl font-sans-extrabold text-white">R</Text>
      </View>
      <Text className="mt-5 text-3xl font-sans-extrabold text-primary">Recurrly</Text>
      <Text className="mt-2 text-sm font-sans-medium text-muted-foreground">Smart billing, simplified</Text>
      <ActivityIndicator size="large" color="#081126" style={{ marginTop: 22 }} />
    </View>
  );
};

export default AppSplash;
