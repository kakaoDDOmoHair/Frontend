import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NotificationItemData } from './StaffData';

interface NotificationItemProps {
  data: NotificationItemData;
  onPress: () => void; // 클릭 시 읽음 처리를 위한 이벤트 추가
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ data, onPress }) => {
  return (
    <TouchableOpacity 
      style={itemStyles.card} 
      activeOpacity={0.8}
      onPress={onPress} // 터치 시 부모 컴포넌트의 handleNotificationPress 실행
    >
      <View style={itemStyles.mainRow}>
        {/* 왼쪽: 아이콘 + 카테고리 + 메시지 */}
        <View style={itemStyles.contentContainer}>
          <Text style={itemStyles.iconText}>{data.icon}</Text>
          <Text style={itemStyles.categoryTag}>{data.name}</Text>
          <Text style={itemStyles.messageText} numberOfLines={1}>
            {data.message}
          </Text>
        </View>

        {/* 오른쪽: 시간 */}
        <Text style={itemStyles.timeText}>{data.time}</Text>
      </View>

      {/* 읽지 않음 상태(!data.isRead)일 때만 빨간색 배지 표시 */}
      {!data.isRead && <View style={itemStyles.unreadBadge} />}
    </TouchableOpacity>
  );
};

const itemStyles = StyleSheet.create({
  card: {
    backgroundColor: '#F3F3F3', // 이미지의 연한 회색 배경
    borderRadius: 10,           // 둥근 모서리
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginHorizontal: 16,
    marginBottom: 10,           // 카드 사이의 간격
    position: 'relative',       // 배지(unreadBadge) 배치를 위한 기준점
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // 메시지가 길어질 경우 대비
    paddingRight: 8,
  },
  iconText: {
    fontSize: 15,
    marginRight: 6,
  },
  categoryTag: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9747FF', // 이미지의 시그니처 보라색
    marginRight: 8,
  },
  messageText: {
    fontSize: 15,
    color: '#000000',
    fontWeight: '400',
    marginLeft: 10,
    flex: 1,
  },
  timeText: {
    fontSize: 13,
    color: '#0000004D', // 이미지의 반투명 검정색
    minWidth: 45,
    textAlign: 'right',
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,    // 이미지처럼 카드 바깥쪽에 살짝 걸치게 배치
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF383C', // 읽지 않은 알림 강조 빨간색
  },
});