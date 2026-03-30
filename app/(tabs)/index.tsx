import "@/global.css";
import { Text, View } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold text-success">
        Welcome to Nativewind!
      </Text>
      <Link
        href="/onboarding"
        className="mt-4 rounded bg-primary px-4 py-2 text-white"
      >
        <Text>Go to Onboarding</Text>
      </Link>
      <Link
        href="/(auth)/sign-in"
        className="mt-4 rounded bg-primary px-4 py-2 text-white"
      >
        <Text>Go to Sign In</Text>
      </Link>
      <Link
        href="/(auth)/sign-up"
        className="mt-4 rounded bg-primary px-4 py-2 text-white"
      >
        <Text>Go to Sign Up</Text>
      </Link>
      <Link
      // this is not working, need to check with expo team about it
        href={`/subscriptions/[id]?id=youtube`}
        className="mt-4 rounded bg-primary px-4 py-2 text-white"
      >
        <Text>Youtube Subscription</Text>
      </Link>
      <Link
        href={{ pathname: "/subscriptions/[id]", params: { id: "claude" } }}
        className="mt-4 rounded bg-primary px-4 py-2 text-white"
      >
        <Text>CLaude Max Subscription</Text>
      </Link>
    </SafeAreaView>
  );
}
