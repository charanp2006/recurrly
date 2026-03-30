import React from 'react';
import { Text, View } from 'react-native'
import '@/global.css';
import { Link } from 'expo-router';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";

const SafeAreaView = styled(RNSafeAreaView);

const signUp = () => {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background">
      <Text> SignUp </Text>
      <Link href="/(tabs)" className="mt-4 rounded bg-primary px-4 py-2 text-white">
        <Text>Create Account</Text>
      </Link>
    </SafeAreaView>
  )
}

export default signUp
