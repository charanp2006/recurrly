import React from "react";
import {
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Check, ChevronDown, Search, SlidersHorizontal, XCircle } from "lucide-react-native";

import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { subscriptionStatusFilters, type SubscriptionFilter } from "@/components/FilterChips";
import SubscriptionCard from "@/components/SubscriptionCard";
import type { Subscription } from "@/type";

const mapFilterToStatus = (filter: SubscriptionFilter): SubscriptionStatus | null => {
  if (filter === "All") return null;
  return filter.toLowerCase() as SubscriptionStatus;
};

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

const ExplorerHeader = React.memo(
  ({
    title,
    subtitle,
    query,
    onChangeQuery,
    onClear,
    selectedFilter,
    onFilterChange,
    isFilterMenuOpen,
    onToggleFilterMenu,
    onCloseFilterMenu,
    resultCount,
    showSummary,
  }: {
    title: string;
    subtitle: string;
    query: string;
    onChangeQuery: (value: string) => void;
    onClear: () => void;
    selectedFilter: SubscriptionFilter;
    onFilterChange: (value: SubscriptionFilter) => void;
    isFilterMenuOpen: boolean;
    onToggleFilterMenu: () => void;
    onCloseFilterMenu: () => void;
    resultCount: number;
    showSummary: boolean;
  }) => {
    return (
      <View className="px-4 pt-4">
        <View className="relative">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="text-start text-[26px] font-sans-extrabold text-[#081126]">
                {title}
              </Text>
              {/* <Text className="mt-2 text-start text-[14px] font-sans-medium text-[#4b5563]">
                {subtitle}
              </Text> */}
            </View>

            <Pressable
              onPress={onToggleFilterMenu}
              accessibilityRole="button"
              accessibilityLabel="Open filters"
              className="mt-1 flex-row items-center rounded-full border border-black/20 bg-[#fff3c8] px-3 py-2"
            >
              <SlidersHorizontal size={16} color="#081126" strokeWidth={2.2} />
              <Text className="mx-2 text-[13px] font-sans-semibold text-[#081126]">{selectedFilter}</Text>
              <ChevronDown size={14} color="#081126" strokeWidth={2.2} />
            </Pressable>
          </View>

          {isFilterMenuOpen ? (
            <View className="absolute right-0 top-12 z-30 w-44 rounded-2xl border border-black/15 bg-[#fff7d9] p-2 shadow-sm">
              {subscriptionStatusFilters.map((filterValue) => {
                const isSelected = selectedFilter === filterValue;

                return (
                  <Pressable
                    key={filterValue}
                    onPress={() => {
                      onFilterChange(filterValue);
                      onCloseFilterMenu();
                    }}
                    className="flex-row items-center justify-between rounded-xl px-3 py-2"
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text className="text-[13px] font-sans-semibold text-[#081126]">{filterValue}</Text>
                    {isSelected ? <Check size={14} color="#081126" strokeWidth={2.4} /> : null}
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>

        <View className="mt-3 flex-row items-center rounded-full border border-black/20 bg-[#fff3c8] px-4 py-2">
          <Search size={18} color="#6f6f6f" strokeWidth={2.2} />
          <TextInput
            value={query}
            onChangeText={onChangeQuery}
            placeholder="Search in insights"
            placeholderTextColor="#6f6f6f"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            className="ml-3 flex-1 text-[15px] font-sans-medium text-[#081126]"
          />
          {query.length > 0 ? (
            <Pressable
              onPress={onClear}
              hitSlop={10}
              className="sub-search-clear"
              accessibilityLabel="Clear search"
              accessibilityRole="button"
            >
              <XCircle size={18} color="#6f6f6f" strokeWidth={2.2} />
            </Pressable>
          ) : null}
        </View>

        {showSummary ? (
          <View className="sub-summary-row mt-4">
            <Text className="sub-summary-text">
              {resultCount} subscription{resultCount === 1 ? "" : "s"}
            </Text>
            <Text className="sub-summary-text">Tap a card to expand details</Text>
          </View>
        ) : null}
      </View>
    );
  },
);

type SubscriptionsExplorerProps = {
  title: string;
  subtitle: string;
  sourceSubscriptions: Subscription[];
  mode: "all" | "renewals";
  showSummary?: boolean;
  showList?: boolean;
  onFilteredChange?: (subscriptions: Subscription[]) => void;
};

const SubscriptionsExplorer = ({
  title,
  subtitle,
  sourceSubscriptions,
  mode,
  showSummary = true,
  showList = true,
  onFilteredChange,
}: SubscriptionsExplorerProps) => {
  const [query, setQuery] = React.useState("");
  const [expandedSubscriptionId, setExpandedSubscriptionId] = React.useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = React.useState<SubscriptionFilter>("All");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = React.useState(false);

  const baseSubscriptions = React.useMemo(() => {
    if (sourceSubscriptions.length > 0) {
      return sourceSubscriptions;
    }

    return HOME_SUBSCRIPTIONS;
  }, [sourceSubscriptions]);

  const filteredSubscriptions = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const statusFilter = mapFilterToStatus(selectedFilter);

    return baseSubscriptions
      .filter((subscription) => {
        if (mode === "renewals") {
          return subscription.status === "active" && !!subscription.renewalDate;
        }

        return true;
      })
      .filter((subscription) => {
        if (!statusFilter) return true;
        return (subscription.status || "active") === statusFilter;
      })
      .filter((subscription) => {
        if (!normalizedQuery) return true;
        return searchableFields(subscription).includes(normalizedQuery);
      })
      .sort((a, b) => {
        if (mode !== "renewals") return 0;
        return new Date(a.renewalDate || a.startDate || 0).valueOf() - new Date(b.renewalDate || b.startDate || 0).valueOf();
      });
  }, [baseSubscriptions, mode, query, selectedFilter]);

  React.useEffect(() => {
    onFilteredChange?.(filteredSubscriptions);
  }, [filteredSubscriptions, onFilteredChange]);

  const clearQuery = React.useCallback(() => setQuery(""), []);

  const renderItem = React.useCallback(
    ({ item }: { item: Subscription }) => (
      <SubscriptionCard
        {...item}
        expanded={expandedSubscriptionId === item.id}
        onPress={() =>
          setExpandedSubscriptionId((currentId) => (currentId === item.id ? null : item.id))
        }
      />
    ),
    [expandedSubscriptionId],
  );

  return (
    <View className="flex-1">
      <ExplorerHeader
        title={title}
        subtitle={subtitle}
        query={query}
        onChangeQuery={setQuery}
        onClear={clearQuery}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        isFilterMenuOpen={isFilterMenuOpen}
        onToggleFilterMenu={() => setIsFilterMenuOpen((current) => !current)}
        onCloseFilterMenu={() => setIsFilterMenuOpen(false)}
        resultCount={filteredSubscriptions.length}
        showSummary={showSummary}
      />

      {showList ? (
        <FlatList
          data={filteredSubscriptions}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          contentContainerClassName="sub-list-content px-4"
          ItemSeparatorComponent={() => <View className="h-4" />}
          renderItem={renderItem}
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
      ) : null}
    </View>
  );
};

export default SubscriptionsExplorer;
