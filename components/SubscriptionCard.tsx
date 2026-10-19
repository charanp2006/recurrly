/**
 * Subscription Card
 *
 * Purpose:
 * - Renders a subscription summary row in compact mode
 * - Expands to show billing metadata and status details
 * - Serves home and subscriptions screens with shared UI
 */
import { View, Text, Pressable } from "react-native";
import React from "react";
import { formatCurrency, formatStatusLabel, formatSubscriptionDateTime } from "@/lib/utils";
import { clsx } from "clsx";
import SubscriptionIcon from "@/components/SubscriptionIcon";
import type { Subscription } from "@/type";

interface SubscriptionCardProps {
    name: string;
    price: number;
    currency?: string;
    icon: Subscription["icon"];
    billing: string;
    color?: string;
    category?: string;
    plan?: string;
    renewalDate?: string;
    expanded: boolean;
    onPress: () => void;
    paymentMethod?: string;
    startDate?: string;
    status?: string;
}

/**
 * Displays one subscription item with expandable metadata content.
 */
const SubscriptionCard = ({
    name,
    price,
    currency,
    icon,
    billing,
    color,
    category,
    plan,
    renewalDate,
    expanded,
    onPress,
    paymentMethod,
    startDate,
    status,
}: SubscriptionCardProps) => {
    /**
     * Uses per-category color when available; falls back to neutral card color.
     */
    const cardBackground = color || "#fcf5dc";

  return (
    <Pressable
      onPress={onPress}
            className={clsx("rounded-3xl p-4", expanded ? "shadow-sm border border-black/10" : "")}
            style={{ backgroundColor: cardBackground }}
    >
            <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1 flex-row items-center gap-3">
                    <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/60">
                        <SubscriptionIcon iconName={icon} size={28} />
                    </View>

                    <View className="min-w-0 flex-1">
                        <Text className="text-[19px] font-sans-extrabold text-[#081126]" numberOfLines={1}>
                            {name}
                        </Text>
                        <Text className="mt-1 text-[13px] font-sans-medium text-[#4b5563]" numberOfLines={1} ellipsizeMode="tail">
                            {category?.trim() || plan?.trim() || (renewalDate ? formatSubscriptionDateTime(renewalDate) : "")}
                        </Text>
                    </View>
                </View>

                <View className="items-end">
                    <Text className="text-[19px] font-sans-extrabold text-[#081126]">
                        {formatCurrency(price, currency)}
                    </Text>
                    <Text className="mt-1 rounded-full bg-white/60 px-3 py-1 text-[12px] font-sans-semibold text-[#4b5563]" numberOfLines={1}>
                        {billing}
                    </Text>
                </View>
            </View>

            {expanded ? (
                <View className="mt-4 rounded-3xl bg-white/45 p-4">
                    <View className="gap-3">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-[14px] font-sans-medium text-[#4b5563]">Payment</Text>
                            <Text className="text-[14px] font-sans-bold text-[#081126]" numberOfLines={1}>
                                {paymentMethod?.trim() || "Not specified"}
                            </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                            <Text className="text-[14px] font-sans-medium text-[#4b5563]">Started</Text>
                            <Text className="text-[14px] font-sans-bold text-[#081126]" numberOfLines={1}>
                                {startDate ? formatSubscriptionDateTime(startDate) : "Not specified"}
                            </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                            <Text className="text-[14px] font-sans-medium text-[#4b5563]">Renewal date</Text>
                            <Text className="text-[14px] font-sans-bold text-[#081126]" numberOfLines={1}>
                                {renewalDate ? formatSubscriptionDateTime(renewalDate) : "Not specified"}
                            </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                            <Text className="text-[14px] font-sans-medium text-[#4b5563]">Status</Text>
                            <Text className="text-[14px] font-sans-bold text-[#081126]" numberOfLines={1}>
                                {status ? formatStatusLabel(status) : "Not specified"}
                            </Text>
                        </View>
                    </View>
                </View>
            ) : null}
    </Pressable>
  );
};

export default SubscriptionCard;
