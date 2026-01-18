import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NotificationData {
  id: number;
  icon: string;
  name: string;
  message: string;
  time: string;
  isRead: boolean;
  category: string;
}

interface NotificationItemProps {
  data: NotificationData;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ data }) => {
  return (
    <TouchableOpacity 
      style={styles.container}
      activeOpacity={0.7}
    >
      {/* 아이콘 */}
      <View style={styles.iconWrapper}>
        <Text style={styles.icon}>{data.icon}</Text>
      </View>

      {/* 내용 */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{data.name}</Text>
          <Text style={styles.time}>{data.time}</Text>
        </View>
        <Text style={styles.message}>{data.message}</Text>
      </View>

      {/* 읽지 않은 표시 */}
      {!data.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 1,
    position: 'relative',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  time: {
    fontSize: 13,
    color: '#8E8E93',
  },
  message: {
    fontSize: 14,
    color: '#3C3C43',
    lineHeight: 20,
  },
  unreadDot: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
});