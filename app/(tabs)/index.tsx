import "@/global.css";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import images from "@/constants/images";
import { icons } from "@/constants/icons";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import ListHeading from "@/components/ListHeading";
import UpcommingSubscriptionCard from "@/components/UpcommingSubscriptionCard";
import SubscriptionCard from "@/components/SubscriptionCard";
import { useEffect, useState, useMemo } from "react";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import { useSubscriptionsStore } from "@/stores/subscriptionsStore";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "react-native-toast-notifications";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const subscriptions = useSubscriptionsStore((state) => state.subscriptions);
  const hasLoaded = useSubscriptionsStore((state) => state.hasLoaded);
  const fetchSubscriptions = useSubscriptionsStore((state) => state.fetchSubscriptions);
  const createSubscription = useSubscriptionsStore((state) => state.createSubscription);
  const { user, token } = useAuth();
  const toast = useToast();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
  const [isCreateSubscriptionModalVisible, setIsCreateSubscriptionModalVisible] = useState(false);

  useEffect(() => {
    if (!token || hasLoaded) {
      return;
    }

    fetchSubscriptions(token).catch((error) => {
      console.error("[Home] Failed to fetch subscriptions:", error);
    });
  }, [fetchSubscriptions, hasLoaded, token]);

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

    await createSubscription(payload, token);
    toast.show("Subscription created", {
      type: "success",
      placement: "top",
      duration: 2500,
    });
  };

  const homeBalance = useMemo(() => {
    const activeSubscriptions = subscriptions.filter((sub) => sub.status === "active");
    const totalMonthlyAmount = activeSubscriptions.reduce((sum, sub) => {
      if (sub.billing === "Yearly") {
        return sum + sub.price / 12;
      }
      return sum + sub.price;
    }, 0);

    const nextRenewal = activeSubscriptions
      .map((sub) => sub.renewalDate)
      .filter(Boolean)
      .sort((a, b) => new Date(a!).getTime() - new Date(b!).getTime())[0];

    return {
      amount: totalMonthlyAmount,
      nextRenewalDate: nextRenewal || new Date().toISOString(),
    };
  }, [subscriptions]);

  const upcomingSubscriptions = useMemo(() => {
    const activeSubscriptions = subscriptions.filter((sub) => sub.status === "active");
    const now = dayjs();

    return activeSubscriptions
      .filter((sub) => sub.renewalDate)
      .map((sub) => {
        const renewalDate = dayjs(sub.renewalDate);
        const daysLeft = renewalDate.diff(now, "day");
        const monthlyPrice = sub.billing === "Yearly" ? sub.price / 12 : sub.price;

        return {
          id: sub.id,
          icon: sub.icon,
          name: sub.name,
          price: monthlyPrice,
          currency: sub.currency,
          daysLeft,
          renewalDate: sub.renewalDate!,
        };
      })
      .filter((sub) => sub.daysLeft >= 0 && sub.daysLeft <= 7)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);
  }, [subscriptions]);

  return (
    <SafeAreaView className="flex-1 p-5 bg-background">
      <CreateSubscriptionModal
        visible={isCreateSubscriptionModalVisible}
        onClose={() => setIsCreateSubscriptionModalVisible(false)}
        onCreate={handleCreateSubscription}
      />

        <FlatList
          ListHeaderComponent={() => (
            <>      
              <View className="home-header">
                <View className="home-user">
                  <Image source={user?.profileImage ? { uri: user.profileImage } : images.avatar} className="home-avatar" />
                  <Text className="home-user-name">{user?.name || "Recurrly Member"}</Text>
                </View>

                <Pressable
                  onPress={() => setIsCreateSubscriptionModalVisible(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Add subscription"
                  hitSlop={10}
                  className="size-12 items-center justify-center"
                >
                  <Image source={icons.add} className="home-add-icon" />
                </Pressable>
              </View>

              <View className="home-balance-card">
                <Text className="home-balance-label">Balance</Text>

                <View className="home-balance-row">
                  <Text className="home-balance-amount">
                    {formatCurrency(homeBalance.amount)}
                  </Text>
                  <Text className="home-balance-date">
                    {dayjs(homeBalance.nextRenewalDate).format("MM/DD")}
                  </Text>
                </View>

              </View>

              <View className="mb-5">
                <ListHeading title="Upcoming Renewals" />
                <FlatList
                  data={upcomingSubscriptions}
                  renderItem={({ item }) => <UpcommingSubscriptionCard {...item} />}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  ListEmptyComponent={<Text className="home-empty-state">No upcoming renewals yet.</Text>}
                />
              </View>
              
              <ListHeading title="All Subscriptions" />
            </>
          )}
          data={subscriptions}
          renderItem={({ item }) => (
            <SubscriptionCard 
              {...item} 
              expanded={expandedSubscriptionId === item.id}
              onPress={() => setExpandedSubscriptionId((currentId) => currentId === item.id ? null : item.id)}
            />
          )}
          keyExtractor={(item) => item.id} 
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text className="home-empty-state">No subscriptions found. Start adding some!</Text>}
          extraData={expandedSubscriptionId}
          ItemSeparatorComponent={() => <View className="h-4" />}
          contentContainerClassName="pb-20"
        />

    </SafeAreaView>
  );
}