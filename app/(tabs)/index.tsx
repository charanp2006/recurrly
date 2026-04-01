import "@/global.css";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import images from "@/constants/images";
import { HOME_BALANCE, HOME_SUBSCRIPTIONS, HOME_USER, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import ListHeading from "@/components/ListHeading";
import UpcommingSubscriptionCard from "@/components/UpcommingSubscriptionCard";
import { FlatList } from "react-native";
import SubscriptionCard from "@/components/SubscriptionCard";
import { useState } from "react";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const [subscriptions, setSubscriptions] = useState(HOME_SUBSCRIPTIONS);
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
  const [isCreateSubscriptionModalVisible, setIsCreateSubscriptionModalVisible] = useState(false);

  const handleCreateSubscription = (subscription: Subscription) => {
    setSubscriptions((currentSubscriptions) => [subscription, ...currentSubscriptions]);
  };

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
                  <Image source={images.avatar} className="home-avatar" />
                  <Text className="home-user-name">{HOME_USER.name}</Text>
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
                    {formatCurrency(HOME_BALANCE.amount)}
                  </Text>
                  <Text className="home-balance-date">
                    {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                  </Text>
                </View>
                
              </View>

              <View className="mb-5">
                <ListHeading title="Upcoming Renewals" />
                <FlatList
                  data={UPCOMING_SUBSCRIPTIONS}
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
