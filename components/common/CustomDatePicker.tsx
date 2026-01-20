import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { CustomInput } from "./CustomInput";

// 화면 너비에 맞게 날짜 칸 크기 계산
const screenWidth = Dimensions.get("window").width;
const calendarPadding = 40; // 모달 안쪽 여백
const dayWidth = (screenWidth * 0.9 - calendarPadding) / 7; // 90% 너비 모달 기준

export const CustomDatePicker = ({
  value,
  onDateChange,
}: {
  value: string;
  onDateChange: (date: string) => void;
}) => {
  const [showModal, setShowModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const dateList = Array.from({ length: daysInMonth }, (_, i) =>
    (i + 1).toString().padStart(2, "0"),
  );

  const prevMonth = () => setCurrentDate(new Date(year, month - 2, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month, 1));

  const handleDateSelect = (day: string) => {
    const formattedDate = `${year}-${month.toString().padStart(2, "0")}-${day}`;
    onDateChange(formattedDate);
    setShowModal(false);
  };

  const today = new Date();
  const isThisMonth =
    today.getFullYear() === year && today.getMonth() + 1 === month;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setShowModal(true)}>
        <View pointerEvents="none">
          <CustomInput
            placeholder="YYYY-MM-DD"
            value={value}
            icon="calendar-outline"
            editable={false}
          />
        </View>
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* 헤더 부분 */}
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={prevMonth} style={styles.arrowBtn}>
                <Ionicons name="chevron-back" size={24} color="#E0D5FF" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {year}년 {month}월
              </Text>
              <TouchableOpacity onPress={nextMonth} style={styles.arrowBtn}>
                <Ionicons name="chevron-forward" size={24} color="#E0D5FF" />
              </TouchableOpacity>
            </View>

            {/* ✨ 수정 1: 요일 행 (한 줄에 꽉 차게) */}
            <View style={styles.weekdaysRow}>
              {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
                <View key={d} style={styles.weekdayWrapper}>
                  <Text
                    style={[
                      styles.weekdayText,
                      d === "토" && { color: "#4A90E2" },
                      d === "일" && { color: "#FF6B6B" },
                    ]}
                  >
                    {d}
                  </Text>
                </View>
              ))}
            </View>

            {/* ✨ 수정 2: 날짜 그리드 (7개씩 자동 줄바꿈) */}
            <View style={styles.daysGrid}>
              {emptyDays.map((_, i) => (
                <View key={`empty-${i}`} style={styles.dayButton} />
              ))}

              {dateList.map((day) => {
                const dateString = `${year}-${month.toString().padStart(2, "0")}-${day}`;
                const isSelected = value === dateString;
                const isToday =
                  new Date().getDate() === parseInt(day) &&
                  new Date().getMonth() + 1 === month &&
                  new Date().getFullYear() === year;

                return (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayButton,
                      isSelected && styles.selectedDayButton,
                      !isSelected && isToday && styles.todayDayButton,
                    ]}
                    onPress={() => handleDateSelect(day)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSelected && styles.selectedDayText,
                        !isSelected && isToday && styles.todayDayText,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.closeBtnText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: "100%" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  }, // 최대 너비 제한
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  arrowBtn: { padding: 5 },
  weekdaysRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingBottom: 5,
  },
  weekdayWrapper: {
    flex: 1, // ✨ 7등분 핵심: 공간을 똑같이 나눠 가짐
    alignItems: "center",
  },
  weekdayText: {
    color: "#999",
    fontSize: 13,
    fontWeight: "600",
    width: dayWidth,
    textAlign: "center",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  dayButton: {
    width: "14.28%",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    marginVertical: 2,
  },
  selectedDayButton: { backgroundColor: "#E0D5FF" },
  todayDayButton: {
    backgroundColor: "#F3E5F5",
    borderWidth: 1,
    borderColor: "#E0D5FF",
  },
  dayText: { fontSize: 14, color: "#333" }, // 앱에서 안 깨지도록 폰트 사이즈 살짝 조절
  selectedDayText: { color: "white", fontWeight: "bold" },
  todayDayText: { color: "#E0D5FF", fontWeight: "bold" },
  closeBtn: { marginTop: 20, padding: 10, alignItems: "center" },
  closeBtnText: { color: "#999", fontSize: 16 },
});
