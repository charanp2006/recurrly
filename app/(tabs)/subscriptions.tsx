import "@/global.css";
import React from "react";
import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import SubscriptionCard from "@/components/SubscriptionCard";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";

const SafeAreaView = styled(RNSafeAreaView);

const searchableFields = (subscription: Subscription) =>
  [
    subscription.name,
    subscription.plan,
    subscription.category,
    subscription.paymentMethod,
    subscription.status,
    subscription.billing,
    subscription.price.toString(),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const Subscriptions = () => {
  const [query, setQuery] = React.useState("");
  const [expandedSubscriptionId, setExpandedSubscriptionId] = React.useState<string | null>(null);

  const filteredSubscriptions = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return HOME_SUBSCRIPTIONS;
    }

    return HOME_SUBSCRIPTIONS.filter((subscription) =>
      searchableFields(subscription).includes(normalizedQuery),
    );
  }, [query]);

  const clearQuery = () => setQuery("");

  return (
    <SafeAreaView className="sub-screen">
      <FlatList
        data={filteredSubscriptions}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="sub-list-content"
        ItemSeparatorComponent={() => <View className="h-4" />}
        ListHeaderComponent={() => (
          <View className="sub-header-block">
            <Text className="sub-screen-title">Subscriptions</Text>
            <Text className="sub-screen-subtitle">
              Search and manage your recurring services
            </Text>

            <View className="sub-search-wrap">
              <Ionicons name="search-outline" size={20} color="#6f6f6f" />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search by name, plan, category, or status"
                placeholderTextColor="#6f6f6f"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                className="sub-search-input"
              />
              {query.length > 0 ? (
                <Pressable onPress={clearQuery} hitSlop={10} className="sub-search-clear">
                  <Ionicons name="close-circle" size={18} color="#6f6f6f" />
                </Pressable>
              ) : null}
            </View>

            <View className="sub-summary-row">
              <Text className="sub-summary-text">
                {filteredSubscriptions.length} subscription
                {filteredSubscriptions.length === 1 ? "" : "s"}
              </Text>
              <Text className="sub-summary-text">Tap a card to expand details</Text>
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() =>
              setExpandedSubscriptionId((currentId) => (currentId === item.id ? null : item.id))
            }
          />
        )}
        ListEmptyComponent={
          <View className="sub-empty-state">
            <Text className="sub-empty-title">No results found</Text>
            <Text className="sub-empty-copy">
              Try a different keyword, category, or status to find a subscription.
            </Text>
          </View>
        }
        extraData={expandedSubscriptionId}
      />
    </SafeAreaView>
  );
};

export default Subscriptions;