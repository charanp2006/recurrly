import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";

const SafeAreaView = styled(RNSafeAreaView);

const subscriptions = () => {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background">
      <Text>subscriptions</Text>
    </SafeAreaView>
  )
}

export default subscriptions