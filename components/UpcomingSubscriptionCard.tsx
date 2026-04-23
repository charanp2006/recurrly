/**
 * Upcoming Subscription Card
 *
 * Purpose:
 * - Displays compact renewal information for an upcoming subscription
 * - Highlights amount due and time remaining until billing
 * - Supports the home screen horizontal upcoming list
 */
import { View, Text } from "react-native";
import React from "react";
import { formatCurrency } from "@/lib/utils";
import type { UpcomingSubscription } from "@/type";
import SubscriptionIcon from "@/components/SubscriptionIcon";

/**
 * Renders one compact card with icon, amount, product name, and due status text.
 */
const UpcomingSubscriptionCard = ({ name, price, daysLeft, icon, currency }: UpcomingSubscription) => {
  /**
   * Converts the numeric days-left value into a readable billing status label.
   */
  const dueLabel =
    daysLeft > 1
      ? `${daysLeft} days left`
      : daysLeft === 1
        ? "1 day left"
        : daysLeft === 0
          ? "Due today"
          : `Overdue by ${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? "" : "s"}`;

  return (
    <View className="mr-4 w-48 rounded-[28px] bg-[#f3e6b3] p-4">
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-2xl bg-white/70">
          <SubscriptionIcon iconName={icon} size={20} />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-[14px] font-sans-extrabold text-[#081126]">{formatCurrency(price, currency)}</Text>
          <Text className="text-[12px] font-sans-semibold text-[#4b5563]" numberOfLines={1}>
            {dueLabel}
          </Text>
        </View>
      </View>

      <Text className="mt-4 text-[15px] font-sans-extrabold text-[#081126]" numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
};

export default UpcomingSubscriptionCard;