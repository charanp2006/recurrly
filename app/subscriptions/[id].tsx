/**
 * Subscription Details Screen
 *
 * Purpose:
 * - Shows rich details for one subscription selected from list screens
 * - Resolves subscription data from store first, then local fallback seed data
 * - Presents a dedicated details UI with billing and plan metadata
 */
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Link, router, useLocalSearchParams } from "expo-router";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useToast } from "react-native-toast-notifications";
import { ChevronLeft, Ellipsis } from "lucide-react-native";

import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { formatCurrency, formatStatusLabel, formatSubscriptionDateTime } from "@/lib/utils";
import { useSubscriptionsStore } from "@/stores/subscriptionsStore";
import SubscriptionIcon from "@/components/SubscriptionIcon";

const SafeAreaView = styled(RNSafeAreaView);

/**
 * Renders the subscription details page for the route id parameter.
 */
const SubscriptionDetails = () => {
  const toast = useToast();
  /**
   * Resolves a single route id regardless of whether Expo returns scalar or array params.
   */
  const { id: rawId } = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const subscriptions = useSubscriptionsStore((state) => state.subscriptions);

  /**
   * Locates subscription by route id from store, then falls back to static sample data.
   */
  const subscription = React.useMemo(() => {
    if (!id) {
      return null;
    }

    return (
      subscriptions.find((item) => item.id === id) ||
      HOME_SUBSCRIPTIONS.find((item) => item.id === id) ||
      null
    );
  }, [id, subscriptions]);

  if (!id || !subscription) {
    return (
      <SafeAreaView className="flex-1 bg-[#fff7d9] px-4">
        <View className="flex-1 items-center justify-center">
          <View className="w-full rounded-4xl border border-black/10 bg-[#fcf5dc] p-6">
            <View className="mb-5 h-16 w-16 items-center justify-center rounded-2xl bg-accent">
              <SubscriptionIcon iconName="default" size={32} color="#fff9e3" />
            </View>
            <Text className="text-[26px] font-sans-extrabold text-[#081126]">Subscription not found</Text>
            <Text className="mt-2 text-[15px] font-sans-medium text-[#4b5563]">
              The subscription you opened is not available in the current session.
            </Text>

            <Pressable
              onPress={() => router.back()}
              className="mt-6 rounded-full bg-[#081126] px-5 py-4"
            >
              <Text className="text-center text-[16px] font-sans-bold text-white">Go back</Text>
            </Pressable>

            <Link
              href="/(tabs)/subscriptions"
              className="mt-4 text-center text-[15px] font-sans-semibold text-[#ea7a53]"
            >
              View all subscriptions
            </Link>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Converts yearly pricing into monthly equivalent for visual consistency.
   */
  const monthlyPrice = subscription.billing === "Yearly" ? subscription.price / 12 : subscription.price;
  const accentColor = subscription.color || "#ea7a53";

  return (
    <SafeAreaView className="flex-1 bg-[#fff7d9]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="px-4 pt-2">
          <View className="flex-row items-center justify-between pb-5">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => router.back()}
              className="h-12 w-12 items-center justify-center rounded-full border border-black/15"
            >
              <ChevronLeft size={20} color="#081126" strokeWidth={2.4} />
            </Pressable>

            <Text className="text-[20px] font-sans-extrabold text-[#081126]">Subscription</Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="More options"
              disabled
              className="h-12 w-12 items-center justify-center rounded-full border border-black/15 opacity-45"
            >
              <Ellipsis size={20} color="#081126" strokeWidth={2.4} />
            </Pressable>
          </View>

          <View className="rounded-[34px] px-5 py-5" style={{ backgroundColor: accentColor }}>
            <View className="flex-row items-start justify-between">
              <View className="h-16 w-16 items-center justify-center rounded-[20px] bg-white/70">
                <SubscriptionIcon iconName={subscription.icon} size={34} />
              </View>

              <View className="rounded-full bg-white/70 px-3 py-2">
                <Text className="text-[13px] font-sans-semibold text-[#081126]">
                  {formatStatusLabel(subscription.status)}
                </Text>
              </View>
            </View>

            <Text className="mt-6 text-[30px] font-sans-extrabold text-[#081126]">
              {subscription.name}
            </Text>
            <Text className="mt-1 text-[16px] font-sans-medium text-[#081126]/75">
              {subscription.plan || subscription.category || "Subscription details"}
            </Text>

            <View className="mt-6 flex-row items-end justify-between">
              <View>
                <Text className="text-[14px] font-sans-medium text-[#081126]/70">Monthly cost</Text>
                <Text className="text-[34px] font-sans-extrabold text-[#081126]">
                  {formatCurrency(monthlyPrice, subscription.currency)}
                </Text>
              </View>

              <View className="items-end">
                <Text className="text-[14px] font-sans-medium text-[#081126]/70">Billing</Text>
                <Text className="text-[18px] font-sans-bold text-[#081126]">{subscription.billing}</Text>
              </View>
            </View>
          </View>

          <View className="mt-4 rounded-[28px] border border-black/10 bg-[#fcf5dc] p-4">
            <Text className="text-[20px] font-sans-extrabold text-[#081126]">Plan details</Text>

            <View className="mt-4 gap-3">
              <View className="flex-row items-center justify-between rounded-[20px] bg-white/70 px-4 py-4">
                <Text className="text-[14px] font-sans-medium text-[#4b5563]">Payment method</Text>
                <Text className="text-[14px] font-sans-bold text-[#081126]" numberOfLines={1}>
                  {subscription.paymentMethod || "Not provided"}
                </Text>
              </View>

              <View className="flex-row items-center justify-between rounded-[20px] bg-white/70 px-4 py-4">
                <Text className="text-[14px] font-sans-medium text-[#4b5563]">Started</Text>
                <Text className="text-[14px] font-sans-bold text-[#081126]" numberOfLines={1}>
                  {formatSubscriptionDateTime(subscription.startDate)}
                </Text>
              </View>

              <View className="flex-row items-center justify-between rounded-[20px] bg-white/70 px-4 py-4">
                <Text className="text-[14px] font-sans-medium text-[#4b5563]">Renewal date</Text>
                <Text className="text-[14px] font-sans-bold text-[#081126]" numberOfLines={1}>
                  {formatSubscriptionDateTime(subscription.renewalDate)}
                </Text>
              </View>

              <View className="flex-row items-center justify-between rounded-[20px] bg-white/70 px-4 py-4">
                <Text className="text-[14px] font-sans-medium text-[#4b5563]">Category</Text>
                <Text className="text-[14px] font-sans-bold text-[#081126]" numberOfLines={1}>
                  {subscription.category || subscription.plan || "Not provided"}
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            className="mt-5 rounded-full bg-[#081126] px-5 py-4"
            onPress={() => toast.show("Cancellation flow will be available soon.", { type: "warning" })}
          >
            <Text className="text-center text-[16px] font-sans-bold text-white">Cancel subscription</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SubscriptionDetails;