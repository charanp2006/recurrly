/**
 * App Splash Component
 *
 * Purpose:
 * - Renders the branded entry experience used by onboarding and loading gates
 * - Establishes visual identity before users navigate into authenticated flows
 * - Provides a consistent first frame while app state initializes
 */

import images from "@/constants/images";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";

const SafeAreaView = styled(RNSafeAreaView);

/**
 * Displays the full-screen branded splash layout with headline and CTA.
 */
const AppSplash = ({ showCTA = true }: { showCTA?: boolean }) => {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const handleGetStarted = () => {
    if (isSignedIn) {
      router.replace("/(tabs)");
      return;
    }

    router.replace("/(auth)/sign-in");
  };

  return (
    <SafeAreaView className="flex-1 bg-[#eb7a53]">
      <View className="flex-1 px-4 pb-6 pt-2">
        <View className="flex-1 items-center justify-center">
          <Image
            source={images.splashPattern}
            resizeMode="contain"
            style={{ width: "100%", maxWidth: 420, aspectRatio: 1 }}
          />
        </View>

        <View className="items-center px-2 pb-2">
          <Text className="text-center text-[44px] font-sans-extrabold leading-tight text-white">
            Gain Financial Clarity
          </Text>
          <Text className="mt-3 text-center text-[18px] font-sans-medium leading-6 text-white/90">
            Track, analyze and cancel with ease
          </Text>

          {showCTA ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Get started"
              className="mt-8 w-full max-w-101 rounded-full bg-white py-4"
              onPress={handleGetStarted}
            >
              <Text className="text-center text-[18px] font-sans-bold text-[#081126]">
                Get Started
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AppSplash;
