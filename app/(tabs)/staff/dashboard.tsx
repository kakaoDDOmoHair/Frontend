import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Location from 'expo-location';
import * as Network from 'expo-network';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ScheduleCard, TabItem } from '../../../components/dashboard/boss_dashboard';
import { SCHEDULES } from '../../../components/dashboard/data';
import { styles } from './dashboard.styles';

interface TodoItem {
  id: number;
  text: string;
  isCompleted: boolean;
}

// 상태 표시 컴포넌트 (디자인은 그대로)
const StatusIndicator = ({ icon, label, isActive }: { icon: any, label: string, isActive: boolean }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
    <Ionicons 
      name={icon} 
      size={16} 
      color={isActive ? '#34C759' : '#AFAFAF'} 
    />
    <Text style={{ 
      fontSize: 13, 
      color: isActive ? '#000' : '#AFAFAF', 
      fontWeight: isActive ? '600' : '400' 
    }}>
      {label}
    </Text>
  </View>
);

export default function DashboardScreen() {
  const [todoText, setTodoText] = useState('');
  const [todoList, setTodoList] = useState<TodoItem[]>([]);
  const [isWorking, setIsWorking] = useState(false);
  
  // 연결 상태
  const [connectionStatus, setConnectionStatus] = useState({
    wifi: false,
    gps: false,
    auth: false,
  });
  const [locationName, setLocationName] = useState('위치 확인 중...');

  // 상태 체크 함수
  const checkAllStatus = async () => {
    try {
      // 1. 와이파이 확인
      const networkStatus = await Network.getNetworkStateAsync();
      const isWifi = networkStatus.type === Network.NetworkStateType.WIFI;
      const isInternet = networkStatus.isInternetReachable ?? false;

      // 2. GPS 확인
      const { status } = await Location.requestForegroundPermissionsAsync();
      const isLocationEnabled = await Location.hasServicesEnabledAsync();
      const isGpsReady = status === 'granted' && isLocationEnabled;

      if (isGpsReady) {
        // 위치 가져오기
        const location = await Location.getCurrentPositionAsync({});
        const address = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        if (address.length > 0) {
          const currentAddr = address[0];
          const text = `${currentAddr.district || ''} ${currentAddr.street || ''}`.trim();
          setLocationName(text || '위치 확인 완료');
        }
      } else {
        setLocationName('GPS 꺼짐');
      }

      setConnectionStatus({
        wifi: isWifi,
        gps: isGpsReady,
        auth: isInternet,
      });

    } catch (e) {
      console.log('상태 체크 에러:', e);
      setLocationName('위치 확인 실패');
    }
  };

  useEffect(() => {
    checkAllStatus(); 
    const interval = setInterval(() => checkAllStatus(), 5000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync('135155');
    Alert.alert('알림', '초대 코드가 복사되었습니다.');
  };

  const addTodo = () => {
    if (todoText.trim() === '') {
      Alert.alert('알림', '할 일을 입력해주세요.');
      return;
    }
    const newTodo: TodoItem = {
      id: Date.now(),
      text: todoText,
      isCompleted: false,
    };
    setTodoList([...todoList, newTodo]);
    setTodoText('');
  };

  const toggleTodo = (id: number) => {
    setTodoList(
      todoList.map((item) =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
      )
    );
  };

  const deleteTodo = (id: number) => {
    Alert.alert('삭제', '이 할 일을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', onPress: () => setTodoList(todoList.filter(item => item.id !== id)) }
    ]);
  };

  // ✨ [핵심 로직] 출근 버튼 클릭 시 처리
  const handleCheckIn = () => {
    // 1. 와이파이도 안 되고, GPS도 안 될 때 -> 에러
    if (!connectionStatus.wifi && !connectionStatus.gps) {
      Alert.alert(
        '출근 불가', 
        '매장 와이파이에 연결하거나,\nGPS(위치)를 켜주세요! 📡📍',
        [
            { text: '확인', style: 'cancel' },
            { text: '설정으로 이동', onPress: () => Linking.openSettings() }
        ]
      );
      return;
    }

    // 2. 인증 방식 결정 (와이파이 우선)
    let authMethod = '';
    if (connectionStatus.wifi) {
      authMethod = '매장 와이파이 인증';
    } else {
      authMethod = 'GPS 위치 인증'; // 와이파이 없으면 GPS로 넘어옴
    }

    const message = isWorking 
      ? '퇴근처리 되었습니다. 고생하셨어요!' 
      : `${authMethod} 완료!\n출근처리 되었습니다.`;
    
    setIsWorking(!isWorking);
    Alert.alert('알림', message);
  };

  // 버튼 텍스트 (상황에 따라 다르게 표시)
  const getButtonText = () => {
    if (isWorking) return '퇴근하기';
    if (connectionStatus.wifi) return '출근하기 (WiFi)'; // 1순위
    if (connectionStatus.gps) return '출근하기 (GPS)';   // 2순위
    return '인증 수단 확인 필요';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 헤더 */}
        <View style={styles.header}>
          <Image source={require('../../../assets/images/logo.png')} style={{ width: 75, height: 70 }} resizeMode="contain" />
          <TouchableOpacity activeOpacity={0.7}>
            <Ionicons name="notifications" size={24} color="#D1C4E9" />
          </TouchableOpacity>
        </View>

        {/* 초대 코드 & 매뉴얼 */}
        <View style={styles.inviteRow}>
          <TouchableOpacity style={styles.inviteCodeBadge} onPress={copyToClipboard} activeOpacity={0.7}>
            <Text style={styles.inviteText}>
              초대 코드 <Text style={styles.purpleText}>135155</Text>
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.manualButton} activeOpacity={0.7}>
            <Text style={styles.manualButtonText}>매뉴얼 열람하기</Text>
          </TouchableOpacity>
        </View>
        
        {/* 1. 월급 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>이번 달 받을 월급은 ? 💰</Text>
          <Text style={styles.dateText}>26.01.01 ~ 2026.01.31</Text>
          <View style={styles.salaryContainer}>
            <Text style={styles.salaryAmount}>759,000</Text>
            <Text style={styles.salaryDesc}>
              전월 대비 <Text style={styles.blueText}>- 20,000</Text> 감소했습니다.
            </Text>
          </View>
        </View>

        {/* 2. 출근 버튼 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>오늘도 화이팅! 💰</Text>
          <Text style={styles.statusText}>현재 상태 : {isWorking ? '근무 중' : '출근 전'}</Text>
          
          {/* 버튼: 둘 중 하나라도 되면 활성화 (보라색) */}
          <TouchableOpacity 
            style={[
                styles.checkInButton, 
                (!connectionStatus.wifi && !connectionStatus.gps) && { backgroundColor: '#E0D5FF' }
            ]}
            activeOpacity={0.8}
            onPress={handleCheckIn}
          >
            <Text style={[
                styles.checkInButtonText, 
                (!connectionStatus.wifi && !connectionStatus.gps) && { color: '#afafaf' }
            ]}>
              {getButtonText()}
            </Text>
          </TouchableOpacity>

          <View style={styles.locationRow}>
            {/* 1. 와이파이 상태 (항상 1순위) */}
            <StatusIndicator 
                icon="wifi" 
                label={connectionStatus.wifi ? "매장 와이파이" : "와이파이 없음"} 
                isActive={connectionStatus.wifi} 
            />
            
            <View style={{ width: 1, height: 12, backgroundColor: '#E0D5FF' }} />
            
            {/* 2. GPS 상태 (와이파이가 되면 비활성 처리) */}
            <StatusIndicator 
                icon="location" 
                // ✨ 와이파이가 켜져있으면 -> "WiFi 사용 중" (GPS 무시)
                // ✨ 와이파이가 꺼져있으면 -> 실제 위치 표시
                label={connectionStatus.wifi ? "WiFi 사용 중" : (connectionStatus.gps ? locationName : "GPS 꺼짐")} 
                
                // ✨ 와이파이가 켜져있으면 -> 무조건 회색(비활성)
                //    와이파이 꺼짐 + GPS 켜짐 -> 초록색(활성)
                isActive={!connectionStatus.wifi && connectionStatus.gps} 
            />
          </View>
        </View>

        {/* 3. 투두리스트 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>오늘의 To Do List</Text>
          {todoList.length === 0 ? (
            <View style={{ paddingVertical: 20, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#AFAFAF', fontSize: 15 }}>
                오늘의 할 일을 입력해주세요 ✏️
              </Text>
            </View>
          ) : (
            todoList.map((item) => (
              <TouchableOpacity 
                key={item.id}
                style={styles.todoItem} 
                activeOpacity={0.8}
                onPress={() => toggleTodo(item.id)}
                onLongPress={() => deleteTodo(item.id)}
              >
                <View style={[
                  styles.checkbox, 
                  item.isCompleted && { backgroundColor: '#9747FF', borderColor: '#9747FF', alignItems: 'center', justifyContent: 'center' }
                ]}>
                  {item.isCompleted && <Ionicons name="checkmark" size={12} color="#fff" />}
                </View>
                <Text style={[
                  styles.todoText, 
                  item.isCompleted && { textDecorationLine: 'line-through', color: '#AFAFAF' }
                ]}>
                  {item.text}
                </Text>
              </TouchableOpacity>
            ))
          )}
          <View style={styles.inputContainer}>
            <TextInput 
              value={todoText}
              onChangeText={setTodoText}
              placeholder="오늘의 할 일을 입력해주세요" 
              style={styles.input}
              placeholderTextColor="#000"
              onSubmitEditing={addTodo}
            />
            <TouchableOpacity onPress={addTodo}> 
              <Ionicons name="add-circle" size={32} color="#000000ff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. 근무 시간표 */}
        <View style={[styles.section, { marginBottom: 80 }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>근무 시간표</Text>
            <TouchableOpacity>
              <Text style={styles.linkText}>등록하기</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {SCHEDULES.map((day, idx) => (
              <View key={idx} style={{ marginRight: 12 }}>
                <ScheduleCard data={day} />
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* 하단 탭바 */}
      <View style={styles.bottomTab}>
        <TabItem icon="wifi" label="출퇴근관리" />
        <TabItem icon="document-text" label="계약서" />
        <TabItem icon="home" label="홈" active />
        <TabItem icon="wallet" label="급여관리" />
        <TabItem icon="person" label="프로필" />
      </View>
    </SafeAreaView>
  );
}