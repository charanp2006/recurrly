import { View, Text } from 'react-native'
import React from 'react'
import { Link, useLocalSearchParams } from 'expo-router';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";

const SafeAreaView = styled(RNSafeAreaView);

const SubscriptionDetails = () => {
    const { id: rawId } = useLocalSearchParams<{ id?: string | string[] }>();
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) {
      return (
        <SafeAreaView className="flex-1 items-center justify-center bg-background px-6">
          <Text className="text-center">Missing subscription id.</Text>
          <Link href="/(tabs)/subscriptions">Back to Subscriptions</Link>
        </SafeAreaView>
      );
    }

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background">
      <Text>Subscription Details: {id}</Text>
      <Link href="/">Go Home</Link>
    </SafeAreaView>
  )
}

export default SubscriptionDetails