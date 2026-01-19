import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  logo: { width: 80, height: 40, resizeMode: "contain" },
  scrollContainer: { padding: 20, paddingBottom: 50 },

  // 섹션 스타일
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 10,
  },
  sectionCard: {
    backgroundColor: "#F7F7F7",
    borderRadius: 10,
    padding: 15,
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    marginTop: 10,
    fontWeight: "bold",
  },

  // 가로 정렬 및 버튼
  rowInput: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  sideButton: {
    backgroundColor: "#EBE6FF",
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  sideButtonText: { color: "#000", fontSize: 15, fontWeight: "600" },

  // 라디오 및 탭

  radioGroup: {
    flexDirection: "row", // 가로 정렬
    gap: 20, // 버튼 사이 간격
    marginTop: 5,
    marginBottom: 10,
  },
  radioItem: {
    flexDirection: "row", // 아이콘과 글자 가로 정렬
    alignItems: "center",
    gap: 8,
  },
  radioText: {
    fontSize: 14,
    color: "#333",
  },
  tabGroup: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  tabActive: {
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EBE6FF",
    flex: 1,
    alignItems: "center",
  },
  tabInactive: { padding: 10, flex: 1, alignItems: "center" },

  submitButton: {
    backgroundColor: "#EBE6FF",
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
});
