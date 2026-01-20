import { Platform, StatusBar, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // 1. 컨테이너 및 전체 레이아웃 (Dashboard 스타일 반영)
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  
  // 2. 헤더 스타일 (Dashboard와 동일하게 정렬)
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 20, // 안드로이드 상태바 여백 대응
    height: 70,    // 로고 이미지 높이 대응
  },

  // 알림 배지
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },

  // 3. 메인 섹션 및 업로드 버튼
  section: { 
    paddingHorizontal: 20, 
    marginTop: 25 
  },
  sectionTitle: { 
    fontSize: 25, 
    fontWeight: 'bold', 
    marginBottom: 15, 
    color: '#000' 
  },
  uploadButton: {
    backgroundColor: '#E9E7FDFF', // 연보라색
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: { 
    fontSize: 20, 
    fontWeight: '600', 
    color: '#9747FF' 
  },

  // 4. 계약 관리 카드 (BossContract용)
  card: {
    backgroundColor: '#DFDFDF4D', // 연한 회색 배경
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#000', 
    marginBottom: 6 
  },
  statusRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  statusDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 5, 
    marginRight: 6,
  },
  statusText: { 
    fontSize: 15, 
    color: '#5c5c5c' 
  },
  buttonRow: { 
    flexDirection: 'row', 
    gap: 10,
    marginTop: 5, 
  },
  actionButton: {
    backgroundColor: '#E9E7FDFF',
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 20,            // 완전히 둥근 캡슐 형태
    alignItems: 'center',        // 내부 텍스트 중앙 정렬
    justifyContent: 'center',
},
  actionButtonText: { 
    fontSize: 15, 
    color: '#000', 
    fontWeight: '400' 
  },

  // 5. 계약서 스캔 모달 (image_4fa301.png 대응)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // 반투명 배경
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 25,
    alignItems: 'center',
  },
  scannerTitle: { 
    fontSize: 25, 
    fontWeight: 'bold', 
    marginBottom: 25,
    color: '#000'
  },
  guideContainer: {
    width: '90%',
    borderWidth: 1,
    borderColor: '#AFAFAF',
    borderRadius: 25,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  guideMainTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    marginBottom: 60, 
    marginTop: 10,
    color: '#000'
  },
  dashedBox: {
    width: '100%',
    height: 300,
    borderWidth: 1,
    borderColor: '#000000',
    borderStyle: 'dashed', // 점선 효과
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  guideText: { 
    fontSize: 15, 
    color: '#FF383C', 
    textAlign: 'center' 
  },
  scanControlRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    width: '110%' 
  },
  scanControlBtn: { 
    alignItems: 'center' 
  },
  controlIcon: { 
    fontSize: 15, 
    fontWeight: '500',
    color: '#000000'
  },
  
  // 모달 하단 버튼 (취소/등록하기)
  modalFooter: { 
    flexDirection: 'row', 
    gap: 15 
  },
  modalCancelBtn: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 35,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E9E7FD',
  },
  modalCancelText: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#000000' 
  },
  modalSubmitBtn: {
    backgroundColor: '#E9E7FD',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  modalSubmitText: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#9747FF' // 강조된 보라색 폰트
  },
});