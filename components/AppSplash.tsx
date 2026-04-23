/**
 * Branded splash / onboarding screen.
 */

import images from "@/constants/images";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";

const SafeAreaView = styled(RNSafeAreaView);

const AppSplash = () => {
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

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Get started"
            className="mt-8 w-full max-w-[404px] rounded-full bg-white py-4"
            onPress={() => {}}
          >
            <Text className="text-center text-[18px] font-sans-bold text-[#081126]">
              Get Started
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AppSplash;
