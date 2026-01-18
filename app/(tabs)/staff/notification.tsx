import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NOTIFICATIONS } from '../../../components/notification/data';
import { NotificationItem } from '../../../components/notification/staff_notification';
import { styles } from './notification.styles';

export default function NotificationScreen() {
  const router = useRouter();
  const [notifications] = useState(NOTIFICATIONS);

  const todayNotifications = notifications.filter(n => n.category === '오늘');
  const yesterdayNotifications = notifications.filter(n => n.category === '어제');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>알림</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* 오늘 */}
        {todayNotifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>오늘</Text>
            {todayNotifications.map((notification) => (
              <NotificationItem key={notification.id} data={notification} />
            ))}
          </View>
        )}

        {/* 어제 */}
        {yesterdayNotifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>어제</Text>
            {yesterdayNotifications.map((notification) => (
              <NotificationItem key={notification.id} data={notification} />
            ))}
          </View>
        )}

        {/* 알림 없을 때 */}
        {notifications.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyText}>새로운 알림이 없습니다</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}