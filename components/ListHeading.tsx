/**
 * List Heading Component
 *
 * Purpose:
 * - Renders section title rows with an optional trailing action button
 * - Standardizes heading presentation across dashboard sections
 */
import { View, Text, TouchableOpacity } from "react-native";
import React from "react";

interface ListHeadingProps {
  title: string;
  onPress?: () => void;
}

/**
 * Displays a section heading with an optional "View all" action.
 */
const ListHeading = ({ title, onPress }: ListHeadingProps) => {
  return (
    <View className="mb-4 mt-7 flex-row items-center justify-between">
      <Text className="text-[25px] font-sans-extrabold text-[#081126]">{title}</Text>

      {onPress ? (
        <TouchableOpacity className="rounded-full border border-black/20 px-3 py-2" onPress={onPress}>
          <Text className="text-[12px] font-sans-semibold text-[#081126]">View all</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default ListHeading;