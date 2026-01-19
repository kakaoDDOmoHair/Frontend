import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// 1. 타입을 StaffData가 아닌 BossData에서 가져와야 합니다.
import { BossNotificationItemData } from './BossData';

interface BossNotificationItemProps {
  // 2. 타입을 BossNotificationItemData로 변경하여 속성을 일치시킵니다.
  data: BossNotificationItemData; 
  onPress: () => void;
}

export const BossNotificationItem: React.FC<BossNotificationItemProps> = ({ data, onPress }) => {
  return (
    <View style={itemStyles.container}>
      <TouchableOpacity 
        style={itemStyles.card} 
        activeOpacity={0.8}
        onPress={onPress}
      >
        <View style={itemStyles.mainRow}>
          <View style={itemStyles.contentContainer}>
            <Text style={itemStyles.iconText}>{data.icon}</Text>
            <Text style={itemStyles.categoryTag}>{data.name}</Text>
            <Text style={itemStyles.messageText} numberOfLines={2}>
              {data.message}
            </Text>
          </View>
          <Text style={itemStyles.timeText}>{data.time}</Text>
        </View>

        {/* 3. 승인/거절 버튼 추가 (BossData에 hasActions: true인 경우에만 표시) */}
        {data.hasActions && (
          <View style={itemStyles.buttonRow}>
            <TouchableOpacity 
              style={itemStyles.actionButton} 
              onPress={() => console.log('거절 클릭')}
            >
              <Text style={[itemStyles.actionButtonText, { color: '#FF3B30' }]}>거절</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={itemStyles.actionButton}
              onPress={() => console.log('승인 클릭')}
            >
              <Text style={[itemStyles.actionButtonText, { color: '#007AFF' }]}>승인</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 안 읽음 표시 빨간 점 */}
        {!data.isRead && <View style={itemStyles.unreadBadge} />}
      </TouchableOpacity>
    </View>
  );
};

const itemStyles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#F3F3F3',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    position: 'relative',
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  iconText: { fontSize: 15, marginRight: 6 },
  categoryTag: {
    fontSize: 18,
    fontWeight: '700',
    color: '#9747FF',
    marginRight: 8,
  },
  messageText: {
    fontSize: 15,
    color: '#000',
    fontWeight: '400',
    flex: 1,
    lineHeight: 20,
  },
  timeText: {
    fontSize: 13,
    color: '#0000004D',
    minWidth: 45,
    textAlign: 'right',
    marginTop: 2,
  },
  // 버튼 레이아웃 스타일
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  unreadBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF383C',
  },
});