/**
 * Monthly Insights Screen
 * 
 * Purpose:
 * - Show user subscription spending insights
 * - Provide monthly summary and category distribution
 * 
 * Key Features:
 * - Total monthly spend
 * - Active subscription count
 * - Top spending category
 * - Lightweight bar-style chart visualization
 */

import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import dayjs from "dayjs";
import { router } from "expo-router";

import BottomActionSheet from "@/components/BottomActionSheet";
import SubscriptionsExplorer from "@/components/SubscriptionsExplorer";
import SubscriptionIcon from "@/components/SubscriptionIcon";
import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { formatCurrency } from "@/lib/utils";
import { useSubscriptionsStore } from "@/stores/subscriptionsStore";
import type { Subscription } from "@/type";

const SafeAreaView = styled(RNSafeAreaView);

type WeeklyBar = {
  label: string;
  value: number;
  accent?: boolean;
  bubble?: string;
};

const weeklyBars: ReadonlyArray<WeeklyBar> = [
  { label: "Mon", value: 36 },
  { label: "Tue", value: 31 },
  { label: "Wed", value: 22 },
  { label: "Thu", value: 40, accent: true, bubble: "$40" },
  { label: "Fri", value: 34 },
  { label: "Sat", value: 20 },
  { label: "Sun", value: 24 },
];

type HistoryItem = {
  id: string;
  name: string;
  subtitle: string;
  amount: string;
  frequency: string;
  icon: Subscription["icon"];
};

const toMonthlyAmount = (sub: Subscription) => (sub.billing === "Yearly" ? sub.price / 12 : sub.price);

const buildHistoryItems = (subscriptions: Subscription[]): HistoryItem[] => {
  return subscriptions.map((subscription) => {
    const monthlyAmount = toMonthlyAmount(subscription);

    return {
      id: subscription.id,
      name: subscription.name,
      subtitle: subscription.renewalDate
        ? dayjs(subscription.renewalDate).format("MMMM D, HH:mm")
        : dayjs(subscription.startDate).format("MMMM D, HH:mm"),
      amount: formatCurrency(monthlyAmount),
      frequency: "per month",
      icon: subscription.icon,
    };
  });
};

const Insights = () => {
  const subscriptions = useSubscriptionsStore((state) => state.subscriptions);
  const [insightsSubscriptions, setInsightsSubscriptions] = React.useState<Subscription[]>([]);
  const [isHistorySheetVisible, setIsHistorySheetVisible] = React.useState(false);

  const baseSubscriptions = React.useMemo(
    () => (subscriptions.length === 0 ? HOME_SUBSCRIPTIONS : subscriptions),
    [subscriptions],
  );

  const totals = React.useMemo(() => {
    const source = insightsSubscriptions.length > 0 ? insightsSubscriptions : baseSubscriptions;
    const activeSubscriptions = source.filter((sub) => sub.status === "active");
    const monthlyCost = activeSubscriptions.reduce((sum, sub) => sum + toMonthlyAmount(sub), 0);

    return {
      monthlyCost,
      percentageChange: null as number | null,
      historyItems: buildHistoryItems(source),
    };
  }, [baseSubscriptions, insightsSubscriptions]);

  const chartHeight = 170;
  const chartMax = 45;
  const tickValues = [45, 35, 25, 5, 0];
  const tickSpacing = tickValues.length > 1 ? chartHeight / (tickValues.length - 1) : 0;
  const tickTops = tickValues.map((_, index) => Math.round(index * tickSpacing));

  return (
    <SafeAreaView className="flex-1 bg-[#fff7d9]">
      <BottomActionSheet
        visible={isHistorySheetVisible}
        onClose={() => setIsHistorySheetVisible(false)}
        title="All History"
      >
        <View className="mt-1 gap-3">
          {totals.historyItems.map((item) => (
            <View key={item.id} className="flex-row items-center rounded-2xl border border-black/10 bg-[#fcf5dc] px-4 py-4">
              <View className="h-12 w-12 items-center justify-center rounded-xl bg-[#f3e6b3]">
                <SubscriptionIcon iconName={item.icon} size={22} />
              </View>

              <View className="ml-3 flex-1">
                <Text className="text-[17px] font-sans-bold text-[#081126]">{item.name}</Text>
                <Text className="mt-1 text-[13px] font-sans-medium text-[#4b5563]">{item.subtitle}</Text>
              </View>

              <Text className="text-[16px] font-sans-extrabold text-[#081126]">{item.amount}</Text>
            </View>
          ))}
        </View>
      </BottomActionSheet>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
        <SubscriptionsExplorer
          title="Monthly Insights"
          subtitle="Analyze subscriptions, spending trends, and upcoming renewals"
          sourceSubscriptions={baseSubscriptions}
          mode="all"
          showSummary={false}
          showList={false}
          onFilteredChange={setInsightsSubscriptions}
        />

        <View className="px-4">

          <View className="mt-4 flex-row items-center justify-between">
            <Text className="text-[26px] font-sans-extrabold text-[#081126]">Upcoming</Text>
            <Pressable className="rounded-full border border-black/20 px-4 py-2" onPress={() => router.push("/(tabs)/renewals") }>
              <Text className="text-[12px] font-sans-semibold text-[#081126]">View all</Text>
            </Pressable>
          </View>

          <View className="mt-4 rounded-3xl bg-[#f3e6b3] px-4 pb-4 pt-5">
            <View className="flex-row" style={{ height: 230 }}>
              <View className="w-8 pt-2">
                {tickValues.map((value, index) => (
                  <Text
                    key={value}
                    className="absolute left-0 text-[12px] font-sans-medium text-[#334155]"
                    style={{ top: tickTops[index] }}
                  >
                    {value}
                  </Text>
                ))}
              </View>

              <View className="ml-1 flex-1">
                {/* <View className="relative justify-end" style={{ height: 192 }}>
                  {tickTops.slice(0, 4).map((top) => ( */}
                  <View className="relative justify-end" style={{ height: chartHeight + 22 }}>
                  {tickTops.slice(0, tickTops.length - 1).map((top) => (
                    <View
                      key={top}
                      className="absolute left-0 right-0 border-b border-dashed border-black/10"
                      style={{ top }}
                    />
                  ))}

                  <View className="flex-row items-end justify-between px-3">
                    {weeklyBars.map((bar) => {
                      const height = (bar.value / chartMax) * chartHeight;

                      return (
                        <View key={bar.label} className="w-[13%] items-center">
                          <View className="mb-2 h-6 items-center justify-end">
                            {bar.bubble ? (
                              <View className="rounded-full bg-white px-2 py-1 shadow-sm">
                                <Text className="text-[11px] font-sans-bold text-[#f27c56]">
                                  {bar.bubble}
                                </Text>
                              </View>
                            ) : null}
                          </View>

                          <View
                            className={bar.accent ? "rounded-full bg-[#f27c56]" : "rounded-full bg-[#0c1325]"}
                            style={{ width: 12, height }}
                          />

                          <Text className="mt-3 text-[13px] font-sans-medium text-[#334155]">
                            {bar.label}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View className="mt-4 rounded-[22px] border border-black/15 bg-[#fcf5dc] px-4 py-4">
            <View className="flex-row items-start justify-between">
              <View>
                <Text className="text-[21px] font-sans-extrabold text-[#081126]">Expenses</Text>
                <Text className="mt-1 text-[15px] font-sans-medium text-[#334155]">{dayjs().format("MMMM YYYY")}</Text>
              </View>

              <View className="items-end">
                <Text className="text-[21px] font-sans-extrabold text-[#081126]">
                  -{formatCurrency(totals.monthlyCost)}
                </Text>
                {typeof totals.percentageChange === "number" ? (
                  <Text className="mt-1 text-[15px] font-sans-semibold text-[#f27c56]">
                    {totals.percentageChange > 0 ? "+" : ""}
                    {totals.percentageChange}%
                  </Text>
                ) : null}
              </View>
            </View>
          </View>

          <View className="mt-8 flex-row items-center justify-between">
            <Text className="text-[26px] font-sans-extrabold text-[#081126]">History</Text>
            <Pressable
              className="rounded-full border border-black/20 px-4 py-2"
              onPress={() => setIsHistorySheetVisible(true)}
            >
              <Text className="text-[12px] font-sans-semibold text-[#081126]">View all</Text>
            </Pressable>
          </View>

          <View className="mt-4 gap-4">
            {totals.historyItems.slice(0, 3).map((item, index) => {
              const cardBackground = index === 0 ? "#f6d74a" : index === 1 ? "#b9dfcf" : "#eddcae";

              return (
                <View key={item.id} className="flex-row items-center rounded-3xl px-4 py-4" style={{ backgroundColor: cardBackground }}>
                  <View className="h-14 w-14 items-center justify-center rounded-2xl bg-black/10">
                    <SubscriptionIcon iconName={item.icon} size={30} />
                  </View>

                  <View className="ml-3 flex-1">
                    <Text className="text-[20px] font-sans-extrabold text-[#081126]">{item.name}</Text>
                    <Text className="mt-1 text-[15px] font-sans-medium text-[#4b5563]">{item.subtitle}</Text>
                  </View>

                  <View className="items-end">
                    <Text className="text-[20px] font-sans-extrabold text-[#081126]">{item.amount}</Text>
                    <Text className="mt-1 text-[15px] font-sans-medium text-[#4b5563]">
                      {item.frequency}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Insights;
