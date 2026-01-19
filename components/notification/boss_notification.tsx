import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../../app/(tabs)/boss/notification.styles';

interface NotificationProps {
  item: {
    type: string;
    content: string;
    time: string;
    color: string;
    hasButtons?: boolean;
  };
}

export const BossNotificationCard = ({ item }: NotificationProps) => {
  return (
    <View style={styles.card}>
      <View style={[styles.iconBadge, { backgroundColor: item.color }]}>
        <Text style={styles.iconText}>{item.type}</Text>
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.contentBody}>
          <Text style={styles.contentText}>{item.content}</Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>

        {item.hasButtons && (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.actionButton, { borderColor: '#FFEDED' }]}>
              <Text style={[styles.actionButtonText, { color: '#FF6B6B' }]}>거절</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { borderColor: '#EBF5FF' }]}>
              <Text style={[styles.actionButtonText, { color: '#007AFF' }]}>승인</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};
