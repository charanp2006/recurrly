import React from "react";
import type { SubscriptionIconName } from "@/constants/subscriptionIcons";
import { subscriptionIconMap } from "@/constants/subscriptionIcons";

type SubscriptionIconProps = {
  iconName: SubscriptionIconName;
  size?: number;
  color?: string;
};

const SubscriptionIcon = ({
  iconName,
  size = 22,
  color = "#081126",
}: SubscriptionIconProps) => {
  const IconComponent = subscriptionIconMap[iconName] ?? subscriptionIconMap.default;

  return <IconComponent size={size} color={color} strokeWidth={2.2} />;
};

export default SubscriptionIcon;
