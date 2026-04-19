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
import { Text, View, ScrollView } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useSubscriptionsStore } from "@/stores/subscriptionsStore";
import { formatCurrency } from "@/lib/utils";

const SafeAreaView = styled(RNSafeAreaView);

const Insights = () => {
  const subscriptions = useSubscriptionsStore((state) => state.subscriptions);

  const totals = React.useMemo(() => {
    const activeSubscriptions = subscriptions.filter((sub) => sub.status === "active");

    const toMonthlyAmount = (sub: Subscription) =>
      sub.billing === "Yearly" ? sub.price / 12 : sub.price;

    const monthlyCost = activeSubscriptions.reduce((sum, sub) => sum + toMonthlyAmount(sub), 0);

    const activeCount = activeSubscriptions.length;

    const byCategory = activeSubscriptions.reduce<Record<string, number>>((acc, sub) => {
      const key = sub.category || "Other";
      acc[key] = (acc[key] || 0) + toMonthlyAmount(sub);
      return acc;
    }, {});

    const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
    const highestValue = Math.max(...Object.values(byCategory), 1);

    const chartData = Object.entries(byCategory)
      .map(([name, amount]) => ({
        name,
        amount,
        widthPercent: Math.max(8, Math.round((amount / highestValue) * 100)),
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      monthlyCost,
      activeCount,
      topCategory,
      chartData,
    };
  }, [subscriptions]);

  return (
    <SafeAreaView className="flex-1 bg-background px-5 pt-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <Text className="text-3xl font-sans-extrabold text-primary">Monthly Insights</Text>
        <Text className="mt-2 text-base font-sans-medium text-muted-foreground">
          Overview of your recurring expenses this month.
        </Text>

        <View className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
          <Text className="text-sm font-sans-semibold text-muted-foreground">Estimated monthly spend</Text>
          <Text className="mt-2 text-3xl font-sans-extrabold text-primary">
            {formatCurrency(totals.monthlyCost)}
          </Text>
        </View>

        <View className="mt-4 flex-row gap-3">
          <View className="flex-1 rounded-2xl bg-white p-4 shadow-sm">
            <Text className="text-xs font-sans-semibold text-muted-foreground">Active plans</Text>
            <Text className="mt-2 text-2xl font-sans-bold text-primary">{totals.activeCount}</Text>
          </View>
          <View className="flex-1 rounded-2xl bg-white p-4 shadow-sm">
            <Text className="text-xs font-sans-semibold text-muted-foreground">Top category</Text>
            <Text className="mt-2 text-lg font-sans-bold text-primary" numberOfLines={1}>{totals.topCategory}</Text>
          </View>
        </View>

        <View className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
          <Text className="text-base font-sans-bold text-primary">Category breakdown</Text>
          <View className="mt-4 gap-3">
            {totals.chartData.map((item) => (
              <View key={item.name}>
                <View className="mb-1 flex-row items-center justify-between">
                  <Text className="text-sm font-sans-medium text-primary">{item.name}</Text>
                  <Text className="text-sm font-sans-semibold text-muted-foreground">{formatCurrency(item.amount)}</Text>
                </View>
                <View className="h-2 rounded-full bg-gray-200">
                  <View
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${item.widthPercent}%` }}
                  />
                </View>
              </View>
            ))}
            {totals.chartData.length === 0 ? (
              <Text className="text-sm font-sans-medium text-muted-foreground">
                No subscriptions yet. Add one to see insights.
              </Text>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Insights;
