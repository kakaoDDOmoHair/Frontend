import { Ionicons } from "@expo/vector-icons";
import axios from "axios"; // axios 라이브러리 필요
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CustomDatePicker from "../../../components/common/CustomDatePicker";
import Footer from "../../../components/common/Footer";
import Header from "../../../components/common/Header";
import { styles } from "../../../styles/tabs/boss/Schedule";

interface Attendance {
  id: number;
  name: string;
  date: string;
  time: string;
  breakTime: string;
  status: "active" | "late" | "absent" | "none";
  isPlanned: boolean;
}

const AttendancePage: React.FC = () => {
  // --- 상태 관리 ---
  const [loading, setLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showEditCalendar, setShowEditCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState("2026-01-20");
  const [breakTime, setBreakTime] = useState("30");

  const [manualData, setManualData] = useState<Attendance[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Attendance | null>(null);
  const [editForm, setEditForm] = useState({
    date: "2026-01-20",
    start: "12:00",
    end: "18:00",
    breakTime: "30",
    isPlanned: false,
  });

  const STORE_ID = 1; // 명세서 기준 storeId 고정 (필요시 동적으로 변경)

  // --- API 1: 일별 근무 기록 조회 (GET) ---
  const fetchAttendance = async (date: string) => {
    try {
      setLoading(true);
      // 명세서: GET /api/v1/attendances/today?storeId=1
      // 실제 서비스에서는 날짜 파라미터를 지원하는 엔드포인트를 사용하세요.
      const response = await axios.get(`/api/v1/attendances/today`, {
        params: { storeId: STORE_ID, date: date },
      });

      if (response.data.success && response.data.data) {
        const mappedData = response.data.data.map((item: any) => ({
          id: item.scheduleId,
          name: item.employeeName || "이름 없음",
          date: date,
          time: `${item.startTime} ~ ${item.endTime}`,
          breakTime: "30분",
          status:
            item.status === "ON"
              ? "active"
              : item.status === "LATE"
                ? "late"
                : "absent",
          isPlanned: false,
        }));
        setManualData(mappedData);
      } else {
        // 데이터가 없는 경우 빈 배열 처리
        setManualData([]);
      }
    } catch (error: any) {
      console.error("데이터 로딩 에러 상세:", error.response || error);
      // 연결 실패 시 사용자 알림 (선택 사항)
      // Alert.alert("연결 오류", "서버 주소를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  // 날짜 변경 시 자동 호출
  useEffect(() => {
    fetchAttendance(selectedDate);
  }, [selectedDate]);

  // --- API 2: 근무 스케줄 수정 (PATCH) ---
  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    // 명세서 Request Body 형식: workDate, startTime, endTime
    const payload = {
      workDate: editForm.date,
      startTime: editForm.start,
      endTime: editForm.end,
    };

    try {
      setLoading(true);
      // 명세서: PATCH /api/v1/schedules/{scheduleId}
      const response = await axios.patch(
        `/api/v1/schedules/${selectedUser.id}`,
        payload,
      );

      if (response.data.success) {
        Alert.alert("알림", response.data.message); // "수정되었습니다."
        setShowEditModal(false);
        fetchAttendance(selectedDate); // 수정 후 현황 새로고침
      }
    } catch (error) {
      console.error("수정 실패:", error);
      Alert.alert("오류", "사장님 권한이 없거나 서버와 통신할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  // --- 유틸리티 로직 ---
  const weekDays = useMemo(() => {
    const current = new Date(selectedDate);
    const sunday = new Date(current);
    sunday.setDate(current.getDate() - current.getDay());
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
      (label, index) => {
        const date = new Date(sunday);
        date.setDate(sunday.getDate() + index);
        return {
          label,
          dateString: date.toISOString().split("T")[0],
          dayNum: date.getDate(),
        };
      },
    );
  }, [selectedDate]);

  const handleEditPress = (user: Attendance) => {
    setSelectedUser(user);
    const times = user.time.includes("~")
      ? user.time.split(" ~ ")
      : ["12:00", "18:00"];
    const bTime = user.breakTime.replace("분", "");
    setEditForm({
      date: user.date,
      start: times[0].trim(),
      end: times[1]?.trim() || "18:00",
      breakTime: bTime,
      isPlanned: user.isPlanned,
    });
    setBreakTime(bTime);
    setShowEditModal(true);
  };

  return (
    <View style={styles.container}>
      <Header notificationCount={5} />

      <ScrollView
        contentContainerStyle={[styles.scrollContainer, { paddingBottom: 150 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>아르바이트생 출퇴근 기록 확인</Text>

        {loading && !showEditModal ? (
          <ActivityIndicator
            size="large"
            color="#A28BFF"
            style={{ marginVertical: 20 }}
          />
        ) : (
          <View style={styles.sectionCard}>
            {manualData.length > 0 ? (
              manualData.map((item) => (
                <View key={item.id} style={styles.infoRow}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.timeText}>{item.time}</Text>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor:
                          item.status === "active"
                            ? "#4ADE80"
                            : item.status === "late"
                              ? "#FACC15"
                              : "#FB7185",
                      },
                    ]}
                  />
                </View>
              ))
            ) : (
              <Text style={{ textAlign: "center", color: "#999" }}>
                기록이 없습니다.
              </Text>
            )}
          </View>
        )}

        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>근무 수정</Text>
          <TouchableOpacity onPress={() => setShowCalendar(!showCalendar)}>
            <Ionicons
              name={showCalendar ? "calendar" : "calendar-outline"}
              size={22}
              color="#A28BFF"
            />
          </TouchableOpacity>
        </View>

        {/* 주간 탭 및 리스트 섹션 (기존 유지) */}
        <View style={styles.sectionCard}>
          <View style={styles.daysHeader}>
            {weekDays.map((item) => (
              <TouchableOpacity
                key={item.label}
                onPress={() => setSelectedDate(item.dateString)}
                style={{ alignItems: "center" }}
              >
                <Text
                  style={
                    item.dateString === selectedDate
                      ? styles.dayTextActive
                      : styles.dayText
                  }
                >
                  {item.label}
                </Text>
                <Text
                  style={
                    item.dateString === selectedDate
                      ? styles.dayTextActive
                      : { color: "#333", fontSize: 14, fontWeight: "600" }
                  }
                >
                  {item.dayNum}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {manualData.map((item) => (
            <View key={item.id} style={styles.infoRow}>
              <TouchableOpacity
                style={styles.nameBadge}
                onPress={() => handleEditPress(item)}
              >
                <Text style={styles.nameBadgeText}>{item.name}</Text>
              </TouchableOpacity>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.timeText}>{item.time}</Text>
              </View>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      item.status === "active"
                        ? "#4ADE80"
                        : item.status === "late"
                          ? "#FACC15"
                          : "#FB7185",
                  },
                ]}
              />
            </View>
          ))}
        </View>

        {/* 캘린더 드롭다운 */}
        {showCalendar && (
          <View style={styles.fixedContainer}>
            <View style={styles.header}>
              <Text style={styles.headerText}>날짜 선택</Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <Ionicons name="close" size={20} color="#999" />
              </TouchableOpacity>
            </View>
            <CustomDatePicker
              visible={true}
              value={selectedDate}
              onDateChange={(d: string) => {
                setSelectedDate(d);
                setShowCalendar(false);
              }}
              onClose={() => setShowCalendar(false)}
            />
          </View>
        )}
      </ScrollView>

      {/* 수정 모달 */}
      <Modal visible={showEditModal} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { maxHeight: "80%" }]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selectedUser?.name} 근무 수정
                </Text>
              </View>

              <View style={styles.categoryGroup}>
                <TouchableOpacity
                  style={[
                    styles.categoryBtn,
                    !editForm.isPlanned && styles.categoryBtnActive,
                  ]}
                  onPress={() => setEditForm({ ...editForm, isPlanned: false })}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      !editForm.isPlanned && styles.categoryTextActive,
                    ]}
                  >
                    등록된 근무
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.categoryBtn,
                    editForm.isPlanned && styles.categoryBtnActive,
                  ]}
                  onPress={() => setEditForm({ ...editForm, isPlanned: true })}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      editForm.isPlanned && styles.categoryTextActive,
                    ]}
                  >
                    기록될 근무
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputField}>
                <Text style={styles.inputLabel}>근무 일자</Text>
                <TouchableOpacity
                  style={styles.dateInputBox}
                  onPress={() => setShowEditCalendar(true)}
                >
                  <Text style={{ color: "#333" }}>{editForm.date}</Text>
                  <Ionicons name="calendar-outline" size={20} color="#A28BFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputField}>
                <Text style={styles.inputLabel}>근무 시간</Text>
                <View style={styles.timeInputRow}>
                  <TextInput
                    style={styles.timeInput}
                    value={editForm.start}
                    onChangeText={(t) => setEditForm({ ...editForm, start: t })}
                    keyboardType="number-pad"
                  />
                  <Text style={{ marginHorizontal: 10, color: "#999" }}>~</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={editForm.end}
                    onChangeText={(t) => setEditForm({ ...editForm, end: t })}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <View style={styles.modalBtnGroup}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text style={styles.cancelBtnText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                  onPress={handleSaveEdit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitBtnText}>수정 완료</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 날짜 선택 팝업 (모달 내부용) */}
      <Modal visible={showEditCalendar} transparent animationType="fade">
        <View style={styles.centerOverlay}>
          <View style={styles.centerModalContainer}>
            <View style={styles.header}>
              <Text style={{ fontSize: 16, fontWeight: "bold", padding: 15 }}>
                근무 일자 선택
              </Text>
              <TouchableOpacity
                onPress={() => setShowEditCalendar(false)}
                style={{ padding: 15 }}
              >
                <Ionicons name="close" size={24} color="#999" />
              </TouchableOpacity>
            </View>
            <CustomDatePicker
              visible={true}
              value={editForm.date}
              onDateChange={(d: string) => {
                setEditForm({ ...editForm, date: d });
                setShowEditCalendar(false);
              }}
              onClose={() => setShowEditCalendar(false)}
            />
          </View>
        </View>
      </Modal>

      <Footer />
    </View>
  );
};

export default AttendancePage;
