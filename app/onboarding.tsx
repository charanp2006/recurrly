import { Text, View } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";

const SafeAreaView = styled(RNSafeAreaView);

const onboarding = () => {
  return (
        <SafeAreaView className="flex-1 items-center justify-center bg-background">
            <Text> onboarding </Text>
        </SafeAreaView>
    )
}

export default onboarding
