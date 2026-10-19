import type { LucideIcon } from "lucide-react-native";
import type { SubscriptionIconName } from "@/constants/subscriptionIcons";

declare global {
    type SubscriptionFrequency = "Monthly" | "Yearly";
    type SubscriptionStatus = "active" | "paused" | "cancelled";

    type SubscriptionCategory =
        | "Entertainment"
        | "AI Tools"
        | "Developer Tools"
        | "Design"
        | "Productivity"
        | "Cloud"
        | "Music"
        | "Other";

    interface AppTab {
        name: string;
        title: string;
        icon: LucideIcon;
    }

    interface TabIconProps {
        focused: boolean;
        icon: LucideIcon;
    }

    interface Subscription {
        id: string;
        icon: SubscriptionIconName;
        name: string;
        plan?: string;
        category?: SubscriptionCategory;
        frequency?: SubscriptionFrequency;
        paymentMethod?: string;
        status?: SubscriptionStatus;
        startDate?: string;
        price: number;
        currency?: string;
        billing: string;
        renewalDate?: string;
        color?: string;
    }

    interface SubscriptionCardProps extends Omit<Subscription, "id"> {
        expanded: boolean;
        onPress: () => void;
        onCancelPress?: () => void;
        isCancelling?: boolean;
    }

    interface UpcomingSubscription {
        id: string;
        icon: SubscriptionIconName;
        name: string;
        price: number;
        currency?: string;
        daysLeft: number;
    }

    interface UpcomingSubscriptionCardProps
        extends Omit<UpcomingSubscription, "id"> {}

    interface ListHeadingProps {
        title: string;
        onPress?: () => void;
    }
}

export type SubscriptionFrequency = globalThis.SubscriptionFrequency;
export type SubscriptionCategory = globalThis.SubscriptionCategory;
export type SubscriptionStatus = globalThis.SubscriptionStatus;
export type AppTab = globalThis.AppTab;
export type Subscription = globalThis.Subscription;
export type UpcomingSubscription = globalThis.UpcomingSubscription;

export {};