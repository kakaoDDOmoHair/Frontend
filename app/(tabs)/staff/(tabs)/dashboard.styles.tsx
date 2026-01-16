import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // 전체 배경색
  },
  scrollContent: {
    paddingBottom: 100, // 탭바 가려짐 방지
  },
  
  // 헤더
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,

  },
  
  // 초대코드 및 매뉴얼 버튼 행
  inviteRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // 오른쪽 정렬
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  inviteCodeBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E0D5FF',
    borderStyle: 'dashed',
  },
  inviteText: {
    fontSize: 15,
    color: '#000',
  },
  purpleText: {
    color: '#9747FF',
    fontWeight: 'bold',
  },
  manualButton: {
    backgroundColor: '#E0D5FF99',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  manualButtonText: {
     fontSize: 15,
    color: '#9747FF',
    fontWeight: 'bold',
  },

  // 공통 섹션 스타일
  section: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 15,
    color: '#AFAFAF',
    marginBottom: 20,
  },
  linkText: {
    fontSize: 15,
    color: '#AFAFAF', // '등록하기' 버튼 색상
    textDecorationLine: 'underline',
  },

  // --- [알바생] 월급 섹션 ---
  salaryContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  salaryAmount: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  salaryDesc: {
    fontSize: 15,
    color: '#000',
  },
  blueText: {
    color: '#0088FF',
    fontWeight: 'bold',
  },

  // --- [알바생] 출퇴근 버튼 섹션 ---
  statusText: {
    fontSize: 15,
    color: '#AFAFAF',
    marginBottom: 15,
  },
  checkInButton: {
    backgroundColor: '#E0D5FF99', // 연한 보라색 배경
    width: '100%',
    height: 60,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#9747FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  checkInButtonText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#000000',
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  locationText: {
    fontSize: 12,
    color: '#C0C0C0',
  },

  // To Do List
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#C0C0C0',
    marginRight: 10,
  },
  todoText: {
    fontSize: 15,
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0D5FF99',
    borderRadius: 25,
    paddingHorizontal: 12,
    marginTop: 10,
    height: 45,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    marginRight: 10,
  },

  // 가로 스크롤 (근무 시간표용)
  horizontalScroll: {
    paddingRight: 20,
  },

  // 하단 탭바
  bottomTab: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 80,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 15,
  },
});