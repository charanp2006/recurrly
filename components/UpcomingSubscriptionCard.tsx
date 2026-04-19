import { View, Text, Image } from 'react-native'
import React from 'react'
import { formatCurrency } from '@/lib/utils'
import type { UpcomingSubscription } from '@/type'

const UpcomingSubscriptionCard = ({name, price, daysLeft, icon, currency}: UpcomingSubscription) => {
  const dueLabel =
    daysLeft > 1
      ? `${daysLeft} days left`
      : daysLeft === 1
        ? '1 day left'
        : daysLeft === 0
          ? 'Due today'
          : `Overdue by ${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? '' : 's'}`;

  return (
    <View className='upcoming-card'>
        <View className='upcoming-row'>
            <Image source={icon} className='upcoming-icon' />
            <View>
                <Text className='upcoming-price'>{(formatCurrency(price, currency))}</Text>
                <Text className='upcoming-meta' numberOfLines={1}>{dueLabel}</Text>
            </View>
        </View>

        <Text className='upcoming-name' numberOfLines={1}>{name}</Text>
    </View>
  )
}

export default UpcomingSubscriptionCard