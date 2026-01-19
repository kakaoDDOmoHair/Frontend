import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { BOSS_NOTIFICATIONS as INITIAL_DATA } from '../../../components/notification/BossData';
import { BossNotificationItem } from '../../../components/notification/BossNotification';
import { styles } from '../../../styles/tabs/boss/Notification';

export default function BossNotificationScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(INITIAL_DATA);

  // 알림 클릭 시 읽음 처리
  const handleNotificationPress = (id: number) => {
    const target = INITIAL_DATA.find(n => n.id === id);
    if (target) {
      target.isRead = true;
    }
    setNotifications([...INITIAL_DATA]);
  };

  // 카테고리별 필터링 (오늘, 어제, 이번 주)
  const todayNotifications = useMemo(() => 
    notifications.filter(n => n.category === '오늘'), [notifications]);
  const yesterdayNotifications = useMemo(() => 
    notifications.filter(n => n.category === '어제'), [notifications]);
  const thisWeekNotifications = useMemo(() => 
    notifications.filter(n => n.category === '이번 주'), [notifications]);
  // '이전 알림' 기능: 오늘과 어제 이번 주 모든 알림 표시
  const earlierNotifications = useMemo(() => 
    notifications.filter((n) => n.category !== '오늘' && n.category !== '어제' && n.category !== '이번 주'), [notifications]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>알림 센터</Text>
        <TouchableOpacity onPress={() => router.back()}>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* 오늘 */}
        {todayNotifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>오늘</Text>
            {todayNotifications.map((n) => (
              <BossNotificationItem 
                key={n.id} 
                data={n} 
                onPress={() => handleNotificationPress(n.id)} 
              />
            ))}
          </View>
        )}

        {/* 어제 */}
        {yesterdayNotifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>어제</Text>
            {yesterdayNotifications.map((n) => (
              <BossNotificationItem 
                key={n.id} 
                data={n} 
                onPress={() => handleNotificationPress(n.id)} 
              />
            ))}
          </View>
        )}

        {/* 이번 주 (이미지 하단 승인/거절 버튼 포함 섹션) */}
        {thisWeekNotifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>이번 주</Text>
            {thisWeekNotifications.map((n) => (
              <BossNotificationItem 
                key={n.id} 
                data={n} 
                onPress={() => handleNotificationPress(n.id)} 
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}