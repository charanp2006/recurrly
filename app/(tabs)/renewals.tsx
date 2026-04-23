import "@/global.css";
import React from "react";
import SubscriptionsExplorer from "@/components/SubscriptionsExplorer";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useSubscriptionsStore } from "@/stores/subscriptionsStore";
import { useAuth } from "@/context/AuthContext";

const SafeAreaView = styled(RNSafeAreaView);

const Renewals = () => {
  const subscriptions = useSubscriptionsStore((state) => state.subscriptions);
  const hasLoaded = useSubscriptionsStore((state) => state.hasLoaded);
  const fetchSubscriptions = useSubscriptionsStore((state) => state.fetchSubscriptions);
  const { token } = useAuth();

  React.useEffect(() => {
    if (!token || hasLoaded) {
      return;
    }

    fetchSubscriptions(token).catch((error) => {
      console.error("[Renewals] Failed to fetch subscriptions:", error);
    });
  }, [fetchSubscriptions, hasLoaded, token]);

  return (
    <SafeAreaView className="sub-screen">
      <SubscriptionsExplorer
        title="Renewals"
        subtitle="Track upcoming renewals and active billing"
        sourceSubscriptions={subscriptions}
        mode="renewals"
      />
    </SafeAreaView>
  );
};

export default Renewals;
