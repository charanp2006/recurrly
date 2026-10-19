/**
 * Subscriptions Tab Screen
 *
 * Purpose:
 * - Lists all subscriptions with search and expansion support
 * - Fetches authenticated user's subscriptions on first entry
 * - Provides filtered discovery by name, plan, category, billing, and status
 */
import "@/global.css";
import React from "react";
import SubscriptionsExplorer from "@/components/SubscriptionsExplorer";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useSubscriptionsStore } from "@/stores/subscriptionsStore";
import { useAuth } from "@/context/AuthContext";

const SafeAreaView = styled(RNSafeAreaView);

/**
 * Renders the subscriptions management tab with searchable, expandable cards.
 */
const Subscriptions = () => {
  const subscriptions = useSubscriptionsStore((state) => state.subscriptions);
  const hasLoaded = useSubscriptionsStore((state) => state.hasLoaded);
  const fetchSubscriptions = useSubscriptionsStore((state) => state.fetchSubscriptions);
  const { token } = useAuth();

  /**
   * Fetches subscriptions once per session when a valid token exists.
   */
  React.useEffect(() => {
    if (!token || hasLoaded) {
      return;
    }

    fetchSubscriptions(token).catch((error) => {
      console.error("[Subscriptions] Failed to fetch subscriptions:", error);
    });
  }, [fetchSubscriptions, hasLoaded, token]);

  return (
    <SafeAreaView className="sub-screen">
      <SubscriptionsExplorer
        title="Subscriptions"
        subtitle="Search and manage your recurring services"
        sourceSubscriptions={subscriptions}
        mode="all"
      />
    </SafeAreaView>
  );
};

export default Subscriptions;