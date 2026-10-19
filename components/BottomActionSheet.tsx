import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type BottomActionSheetProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  showCancelButton?: boolean;
  maxHeight?: number;
};

const BottomActionSheet = ({
  visible,
  title,
  onClose,
  children,
  showCancelButton = true,
  maxHeight = 620,
}: BottomActionSheetProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/35">
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="w-full"
        >
          <View
            className="max-h-[90%] rounded-t-[30px] border-x border-t border-black/20 bg-[#fff7d9]"
            style={{ maxHeight }}
          >
            <View className="items-center pb-2 pt-3">
              <View className="h-1.5 w-12 rounded-full bg-black/20" />
            </View>

            <View className="flex-row items-center justify-between px-5 pb-2">
              <Text className="text-[20px] font-sans-extrabold text-[#081126]">{title}</Text>
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close sheet"
                className="rounded-full border border-black/20 px-3 py-1"
              >
                <Text className="text-[14px] font-sans-semibold text-[#081126]">Close</Text>
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerClassName="px-5 pb-5"
            >
              {children}

              {showCancelButton ? (
                <Pressable
                  onPress={onClose}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel"
                  className="mt-4 rounded-full border border-black/25 bg-[#fff3c8] py-3"
                >
                  <Text className="text-center text-[15px] font-sans-semibold text-[#081126]">Cancel</Text>
                </Pressable>
              ) : null}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default BottomActionSheet;
