/**
 * Home Tab Screen
 *
 * Purpose:
 * - Presents dashboard metrics for subscription spending
 * - Shows upcoming renewals and full subscription list
 * - Acts as the primary entry screen for signed-in users
 */
import "@/global.css";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import ListHeading from "@/components/ListHeading";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import SubscriptionCard from "@/components/SubscriptionCard";
import { useEffect, useState } from "react";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import { useSubscriptionsStore } from "@/stores/subscriptionsStore";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "react-native-toast-notifications";
import { useRouter } from "expo-router";
import { CircleUserRound, Plus } from "lucide-react-native";
import type { SubscriptionCategory, SubscriptionFrequency } from "@/type";

const SafeAreaView = styled(RNSafeAreaView);

/**
 * Renders the home dashboard, including balance, upcoming renewals, and list details.
 */
export default function App() {
  const router = useRouter();
  const subscriptions = useSubscriptionsStore((state) => state.subscriptions);
  const isLoading = useSubscriptionsStore((state) => state.isLoading);
  const error = useSubscriptionsStore((state) => state.error);
  const hasLoaded = useSubscriptionsStore((state) => state.hasLoaded);
  const fetchSubscriptions = useSubscriptionsStore((state) => state.fetchSubscriptions);
  const createSubscription = useSubscriptionsStore((state) => state.createSubscription);
  const { user, token } = useAuth();
  const toast = useToast();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
  const [isCreateSubscriptionModalVisible, setIsCreateSubscriptionModalVisible] = useState(false);

  const sourceSubscriptions = subscriptions.length === 0 ? HOME_SUBSCRIPTIONS : subscriptions;

  /**
   * Active subscriptions are the source of spend and renewal calculations.
   */
  const activeSubscriptions = sourceSubscriptions.filter((subscription) => subscription.status === "active");

  /**
   * Normalizes yearly plans into monthly-equivalent values to compute dashboard balance.
   */
  const homeBalance = activeSubscriptions.reduce(
    (sum, sub) => sum + (sub.billing === "Yearly" ? sub.price / 12 : sub.price),
    0,
  );

  /**
   * Prepares at-most-five nearest renewals with derived day-delta labels.
   */
  const upcomingSubscriptions = [...activeSubscriptions]
    .filter((sub) => sub.renewalDate)
    .sort((a, b) => dayjs(a.renewalDate).valueOf() - dayjs(b.renewalDate).valueOf())
    .slice(0, 5)
    .map((sub) => ({
      id: sub.id,
      icon: sub.icon,
      name: sub.name,
      price: sub.price,
      currency: sub.currency,
      daysLeft: Math.max(0, dayjs(sub.renewalDate).startOf("day").diff(dayjs().startOf("day"), "day")),
    }));

  /**
   * Derives the next renewal date shown in the balance card summary.
   */
  const nextRenewalDate = upcomingSubscriptions[0]
    ? activeSubscriptions.find((sub) => sub.id === upcomingSubscriptions[0].id)?.renewalDate
    : null;

  /**
   * Loads subscriptions only when authenticated and not already fetched in current session.
   */
  useEffect(() => {
    if (!token || hasLoaded) {
      return;
    }

    fetchSubscriptions(token).catch((error) => {
      console.error("[Home] Failed to fetch subscriptions:", error);
    });
  }, [fetchSubscriptions, hasLoaded, token]);

  /**
   * Creates a new subscription through the store and surfaces user feedback toasts.
   */
  const handleCreateSubscription = async (payload: {
    name: string;
    price: number;
    frequency: SubscriptionFrequency;
    category: SubscriptionCategory;
    paymentMethod: string;
    startDate: string;
  }) => {
    if (!token) {
      throw new Error("You are not signed in.");
    }

    try {
      await createSubscription(payload, token);
      toast.show("Subscription created", {
        type: "success",
        placement: "top",
        duration: 2500,
      });
    } catch (error: any) {
      const errorMessage =
        error?.message || error?.response?.data?.message || "Failed to create subscription";

      toast.show(errorMessage, {
        type: "danger",
        placement: "top",
        duration: 3000,
      });
      throw error;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#fff7d9]">
      <CreateSubscriptionModal
        visible={isCreateSubscriptionModalVisible}
        onClose={() => setIsCreateSubscriptionModalVisible(false)}
        onCreate={handleCreateSubscription}
      />

        <FlatList
          contentContainerStyle={{ paddingHorizontal: 16 }}
          ListHeaderComponent={() => (
            <>
              <View className="flex-row items-center justify-between pt-2">
                <View className="flex-row items-center gap-3">
                  <View className="h-14 w-14 items-center justify-center rounded-full bg-[#f3e6b3]">
                    {user?.profileImage ? (
                      <Image source={{ uri: user.profileImage }} className="h-14 w-14 rounded-full" />
                    ) : (
                      <CircleUserRound size={45} color="#081126" strokeWidth={1.2} />
                    )}
                  </View>
                  <View>
                    <Text className="text-[12px] font-sans-medium text-[#4b5563]">Welcome back</Text>
                    <Text className="text-[20px] font-sans-extrabold text-[#081126]">
                      {user?.name || "Recurrly Member"}
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => setIsCreateSubscriptionModalVisible(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Add subscription"
                  hitSlop={10}
                  className="h-12 w-12 items-center justify-center rounded-full bg-accent"
                >
                  <Plus size={22} color="#fff9e3" strokeWidth={2.5} />
                </Pressable>
              </View>

              <View className="mt-5 rounded-4xl bg-accent p-5">
                <Text className="text-[18px] font-sans-semibold text-white/85">Balance</Text>
                <View className="mt-4 flex-row items-end justify-between">
                  <Text className="text-[32px] font-sans-extrabold text-white">
                    {formatCurrency(homeBalance)}
                  </Text>
                  <View className="items-end">
                    <Text className="text-[14px] font-sans-medium text-white/80">Next renewal</Text>
                    <Text className="mt-1 text-[18px] font-sans-bold text-white">
                      {nextRenewalDate ? dayjs(nextRenewalDate).format("MM/DD") : "--/--"}
                    </Text>
                  </View>
                </View>

                <View className="mt-5 flex-row items-center justify-between rounded-[22px] bg-white/15 px-4 py-3">
                  <Text className="text-[15px] font-sans-medium text-white/85">Tracked subscriptions</Text>
                  <Text className="text-[15px] font-sans-semibold text-white">{sourceSubscriptions.length}</Text>
                </View>
              </View>

              <ListHeading title="Upcoming Renewals" onPress={() => router.push("/(tabs)/renewals")} />
              <FlatList
                data={upcomingSubscriptions}
                renderItem={({ item }) => <UpcomingSubscriptionCard {...item} />}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={<Text className="py-2 text-[14px] font-sans-medium text-[#4b5563]">No upcoming renewals yet.</Text>}
              />
              {isLoading ? <Text className="py-3 text-[14px] font-sans-medium text-[#4b5563]">Loading subscriptions...</Text> : null}
              {error ? <Text className="py-3 text-[14px] font-sans-medium text-[#4b5563]">{error}</Text> : null}

              <ListHeading title="All Subscriptions" onPress={() => router.push("/(tabs)/subscriptions")} />
            </>
          )}
          data={sourceSubscriptions}
          renderItem={({ item }) => (
            <SubscriptionCard
              {...item}
              expanded={expandedSubscriptionId === item.id}
              onPress={() => setExpandedSubscriptionId((currentId) => (currentId === item.id ? null : item.id))}
            />
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text className="py-4 text-[14px] font-sans-medium text-[#4b5563]">No subscriptions found. Start adding some!</Text>}
          extraData={expandedSubscriptionId}
          ItemSeparatorComponent={() => <View className="h-4" />}
          contentContainerClassName="pb-24"
        />

    </SafeAreaView>
  );
}
