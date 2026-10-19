import React from "react";
import { Pressable, Text, View } from "react-native";
import { clsx } from "clsx";

export const subscriptionStatusFilters = ["All", "Active", "Paused", "Cancelled"] as const;

export type SubscriptionFilter = (typeof subscriptionStatusFilters)[number];

type FilterChipsProps = {
  value: SubscriptionFilter;
  onChange: (next: SubscriptionFilter) => void;
};

const FilterChips = ({ value, onChange }: FilterChipsProps) => {
  return (
    <View className="mt-5 flex-row flex-wrap gap-2">
      {subscriptionStatusFilters.map((chip) => {
        const isSelected = value === chip;

        return (
          <Pressable
            key={chip}
            onPress={() => onChange(chip)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            className={clsx(
              "rounded-full border px-4 py-2",
              isSelected ? "border-[#081126] bg-[#081126]" : "border-black/20 bg-[#fff3c8]",
            )}
          >
            <Text
              className={clsx(
                "text-[13px] font-sans-semibold",
                isSelected ? "text-white" : "text-[#081126]",
              )}
            >
              {chip}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default FilterChips;
