import React from 'react';
import { Text, View } from 'react-native'
import '@/global.css';
import { Link } from 'expo-router';

const signUp = () => {
  return (
    <View>
      <Text> SignUp </Text>
      <Link href="/(auth)/sign-up" className="mt-4 rounded bg-primary px-4 py-2 text-white">
        <Text>Create Account</Text>
      </Link>
    </View>
  )
}

export default signUp
