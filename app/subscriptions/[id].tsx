import { View, Text } from 'react-native'
import React from 'react'
import { Link, useLocalSearchParams } from 'expo-router';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";

const SafeAreaView = styled(RNSafeAreaView);

const SubscriptionDetails = () => {
    const {id} = useLocalSearchParams<{id: string}>(); // This would typically come from route params or state
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background">
      <Text>Subscription Details: {id}</Text>
      <Link href="/">Go Back</Link>
    </SafeAreaView>
  )
}

export default SubscriptionDetails