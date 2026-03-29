import React from 'react';
import { Text, View } from 'react-native'
import '@/global.css';
import { Link } from 'expo-router';

const signIn = () => {
  return (
    <View>
      <Text> SignIn </Text>
      <Link href="/(auth)/sign-in" className="mt-4 rounded bg-primary px-4 py-2 text-white">
        <Text>Sign In</Text>
      </Link>
    </View>
  )
}

export default signIn
