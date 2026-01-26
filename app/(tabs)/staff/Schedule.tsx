import api from "@/constants/api"; // ✅ Axios 인스턴스 사용
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Calendar } from "react-native-calendars";
import CustomDatePicker from "../../../components/common/CustomDatePicker";
import Footer from "../../../components/common/Footer";
import Header from "../../../components/common/Header";
import { styles } from "../../../styles/tabs/staff/Schedule";

interface WorkData {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  breakTime: string;
  registeredTime: string;
  wifiTime: string;
  isPlanned: boolean;
  storeName: string;
}

const WorkerSchedule: React.FC = () => {
  const STORE_ID = 1; // 실제 DB 매장 ID와 일치해야 함
  const USER_ID = 2; // 실제 DB 사용자 ID와 일치해야 함
  const today = new Date().toISOString().split("T")[0];

  // --- 상태 관리 ---
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(today);
  const [workHistory, setWorkHistory] = useState<WorkData[]>([]);

  // 모달 제어
  const [showCalendar, setShowCalendar] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [requestModalVisible, setRequestModalVisible] = useState(false);

  // 입력 데이터
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [breakTime, setBreakTime] = useState("");
  const [reason, setReason] = useState("");

  // 메뉴 및 타입 설정
  const [showRequestMenu, setShowRequestMenu] = useState(false);
  const [requestType, setRequestType] = useState<"수정" | "삭제">("수정");
  const [category, setCategory] = useState<"등록된 근무" | "기록된 근무">(
    "등록된 근무",
  );

  // --- API 1: 월간 스케줄 조회 ---
  const fetchMonthlySchedule = async (date: string) => {
    try {
      setLoading(true);
      const [year, month] = date.split("-");
      const response = await api.get(`/api/v1/schedules/monthly`, {
        params: {
          storeId: Number(STORE_ID),
          year: Number(year),
          month: Number(month),
        },
      });

      let dataList = response.data.data || response.data || [];

      // 테스트용 임시 데이터 (DB에 정보가 없을 때만 작동)
      if (dataList.length === 0) {
        dataList = [
          {
            userId: 2,
            date: `${year}-${month}-26`,
            name: "임스테스트",
            time: "09:00~18:00",
          },
        ];
      }

      const mappedData = dataList.map((item: any) => ({
        id: item.scheduleId || item.userId || Math.random(),
        date: item.date,
        startTime: item.time?.split("~")[0] || "09:00",
        endTime: item.time?.split("~")[1] || "18:00",
        registeredTime: item.time || "",
        wifiTime: "",
        isPlanned: new Date(item.date) > new Date(today),
        storeName: item.name || "매장 정보 없음",
        breakTime: "30",
      }));
      setWorkHistory(mappedData);
    } catch (error) {
      console.error("조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlySchedule(selectedDate);
  }, [selectedDate.split("-")[1]]);

  // --- API 2: 근무 스케줄 등록 ---
  const handleSave = async () => {
    if (!startTime || !endTime) {
      Alert.alert("알림", "시간을 입력해주세요.");
      return;
    }
    const payload = {
      storeId: STORE_ID,
      userId: USER_ID,
      workDate: selectedDate,
      startTime,
      endTime,
    };
    try {
      setLoading(true);
      const response = await api.post(`/api/v1/schedules`, payload);
      if (response.status === 200 || response.status === 201) {
        Alert.alert("성공", "근무 스케줄이 등록되었습니다.");
        setShowActionModal(false);
        fetchMonthlySchedule(selectedDate);
      }
    } catch (error: any) {
      Alert.alert("오류", error.response?.data?.message || "등록 실패");
    } finally {
      setLoading(false);
    }
  };

  // --- API 3: 정정 요청 (수정/삭제) ---
  const handleRequestSubmit = async () => {
    if (!reason) {
      Alert.alert("알림", "사유를 입력해주세요.");
      return;
    }
    const payload = {
      storeId: STORE_ID,
      userId: USER_ID,
      targetDate: selectedDate,
      requestType: requestType === "수정" ? "UPDATE" : "DELETE",
      category: category === "등록된 근무" ? "SCHEDULE" : "RECORD",
      requestTime: `${startTime}~${endTime}`, // 수정/삭제 모두 현재 설정된 시간을 보냄
      reason: reason,
    };
    try {
      setLoading(true);
      const response = await api.post(`/api/v1/modifications`, payload);
      if (response.status === 200 || response.status === 201) {
        Alert.alert("성공", `${requestType} 요청을 보냈습니다.`);
        setRequestModalVisible(false);
        setReason("");
      }
    } catch (error) {
      Alert.alert("오류", "전송 실패");
    } finally {
      setLoading(false);
    }
  };

  // 유틸리티
  const formatTime = (text: string, setter: (val: string) => void) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    let formatted = cleaned;
    if (cleaned.length >= 3)
      formatted = `${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`;
    setter(formatted.slice(0, 5));
  };
  const getBadgeInfo = (dateString: string) => {
    const data = workHistory.find((d) => d.date === dateString);
    if (!data) return null;

    const [startH, startM] = data.startTime.split(":").map(Number);
    const [endH, endM] = data.endTime.split(":").map(Number);
    const totalMinutes = endH * 60 + endM - (startH * 60 + startM);
    const actualWorkMinutes = totalMinutes - parseInt(data.breakTime || "0");
    const h = Math.floor(actualWorkMinutes / 60);
    const m = actualWorkMinutes % 60;

    let color = "#6B4EFF"; // ✨ 보라색 (시간 일치)
    let bgColor = "#F0EBFF";

    if (data.isPlanned) {
      color = "#4A90E2"; // ✨ 파란색 (예정 근무)
      bgColor = "#E1F0FF";
    } else if (data.registeredTime !== data.wifiTime && data.wifiTime !== "") {
      color = "#FF6B6B"; // ✨ 빨간색 (시간 불일치)
      bgColor = "#FFDADA";
    }

    return { label: `${h}h ${m > 0 ? m + "m" : ""}`, color, bgColor };
  };

  const selectedWorkDetail = useMemo(
    () => workHistory.find((w) => w.date === selectedDate),
    [workHistory, selectedDate],
  );

  const shiftDate = (days: number) => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + days);
    setSelectedDate(currentDate.toISOString().split("T")[0]);
  };

  return (
    <View style={styles.container}>
      <Header notificationCount={5} />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>근무 시간</Text>
          <View style={styles.iconRow}>
            <TouchableOpacity onPress={() => setShowActionModal(true)}>
              <Ionicons name="add-circle" size={32} color="#D1C4E9" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowRequestMenu(!showRequestMenu)}
            >
              <MaterialCommunityIcons
                name="hands-pray"
                size={28}
                color="#D1C4E9"
              />
            </TouchableOpacity>
          </View>
          {showRequestMenu && (
            <View style={styles.floatingMenu}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setRequestType("수정");
                  setRequestModalVisible(true);
                  setShowRequestMenu(false);
                }}
              >
                <Text style={styles.menuText}>수정</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setRequestType("삭제");
                  setRequestModalVisible(true);
                  setShowRequestMenu(false);
                }}
              >
                <Text style={styles.menuText}>삭제</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.historyCard}>
          <View style={styles.tableHeader}>
            <Text style={styles.columnLabel}>날짜</Text>
            <Text style={styles.columnLabel}>등록 시간</Text>
            <Text style={styles.columnLabel}>기록 시간</Text>
          </View>
          {workHistory.length > 0 ? (
            workHistory
              .sort(
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime(),
              )
              .map((item) => (
                <View key={item.id} style={styles.tableRow}>
                  <Text style={styles.dateCell}>
                    {item.date.split("-")[1]}월 {item.date.split("-")[2]}일
                  </Text>
                  <Text style={styles.timeCell}>{item.registeredTime}</Text>
                  <Text style={styles.timeCell}>
                    {item.isPlanned ? "-" : item.wifiTime || "-"}
                  </Text>
                </View>
              ))
          ) : (
            <Text style={{ textAlign: "center", padding: 20, color: "#999" }}>
              기록이 없습니다.
            </Text>
          )}
        </View>

        <View style={styles.calendarWrapper}>
          <Calendar
            current={selectedDate}
            onDayPress={(day: any) => {
              setSelectedDate(day.dateString);
              setShowDetailModal(true);
            }}
            renderArrow={(direction) => (
              <Ionicons
                name={direction === "left" ? "chevron-back" : "chevron-forward"}
                size={24}
                color="#E0D5FF"
              />
            )}
            theme={{
              todayTextColor: "#E0D5FF",
              arrowColor: "#E0D5FF",
              calendarBackground: "#F2F2F2",
              textMonthFontWeight: "bold",
            }}
            style={{ borderRadius: 20 }}
            dayComponent={({ date }: any) => {
              const badge = getBadgeInfo(date.dateString);
              const isToday = date.dateString === today;
              return (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedDate(date.dateString);
                    setShowDetailModal(true);
                  }}
                  style={[
                    styles.dayBox,
                    date.dateString === selectedDate && styles.selectedDay,
                    isToday && { backgroundColor: "#E0D5FF", borderRadius: 15 },
                  ]}
                >
                  <Text
                    style={[styles.dayText, isToday && { fontWeight: "bold" }]}
                  >
                    {date.day}
                  </Text>
                  {badge && (
                    <View
                      style={[styles.badge, { backgroundColor: badge.bgColor }]}
                    >
                      <Text style={[styles.badgeText, { color: badge.color }]}>
                        {badge.label}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </ScrollView>

      {/* 1. 근무 상세 모달 */}
      <Modal visible={showDetailModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.detailHeader}>
              <TouchableOpacity onPress={() => shiftDate(-1)}>
                <Ionicons name="chevron-back" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {selectedDate.split("-")[1]}월 {selectedDate.split("-")[2]}일
                근무
              </Text>
              <TouchableOpacity onPress={() => shiftDate(1)}>
                <Ionicons name="chevron-forward" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.detailInfoBox}>
              <Text style={styles.storeName}>
                {selectedWorkDetail
                  ? selectedWorkDetail.storeName
                  : "매장 정보 없음"}
              </Text>
              {selectedWorkDetail && (
                <>
                  <Text style={styles.detailTimeText}>
                    {selectedWorkDetail.startTime} ~{" "}
                    {selectedWorkDetail.endTime}
                  </Text>
                  <Text style={styles.detailSubText}>
                    (휴게시간: {selectedWorkDetail.breakTime}분)
                  </Text>
                </>
              )}
            </View>
            <View style={styles.modalBtnGroup}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowDetailModal(false)}
              >
                <Text style={styles.cancelBtnText}>뒤로 가기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={() => {
                  setShowDetailModal(false);
                  setShowActionModal(true);
                }}
              >
                <Text style={styles.submitBtnText}>근무 추가</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 2. 근무 등록 모달 */}
      <Modal visible={showActionModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>근무 등록</Text>
              <View style={styles.userTag}>
                <Text style={styles.userTagText}>JUN</Text>
              </View>
            </View>
            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>날짜</Text>
              <TouchableOpacity
                style={styles.dateInputBox}
                onPress={() => setShowCalendar(true)}
              >
                <Text>{selectedDate}</Text>
                <Ionicons name="calendar-outline" size={20} color="#AAA" />
              </TouchableOpacity>
            </View>
            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>근무 시간</Text>
              <View style={styles.timeInputRow}>
                <View style={styles.inputItem}>
                  <TextInput
                    style={styles.timeInput}
                    value={startTime}
                    onChangeText={(t) => formatTime(t, setStartTime)}
                    keyboardType="number-pad"
                    maxLength={5}
                    placeholder="09:00"
                  />
                </View>
                <Text style={{ fontSize: 20 }}>~</Text>
                <View style={styles.inputItem}>
                  <TextInput
                    style={styles.timeInput}
                    value={endTime}
                    onChangeText={(t) => formatTime(t, setEndTime)}
                    keyboardType="number-pad"
                    maxLength={5}
                    placeholder="18:00"
                  />
                </View>
              </View>
            </View>
            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>휴게 시간 (분)</Text>
              <View style={styles.breakTimeGroup}>
                {["30", "60"].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.breakTimeBtn,
                      breakTime === t && styles.breakTimeBtnActive,
                    ]}
                    onPress={() => setBreakTime(t)}
                  >
                    <Text>{t}분</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.modalBtnGroup}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowActionModal(false)}
              >
                <Text style={styles.cancelBtnText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleSave}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>저장</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 3. 수정/삭제 요청 모달 (통합) */}
      <Modal visible={requestModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{requestType} 요청하기</Text>
              <View style={styles.userTag}>
                <Text style={styles.userTagText}>JUN</Text>
              </View>
            </View>
            <View style={styles.categoryGroup}>
              {["등록된 근무", "기록된 근무"].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.categoryBtn,
                    category === item && styles.categoryBtnActive,
                  ]}
                  onPress={() => setCategory(item as any)}
                >
                  <Text style={category === item ? { color: "#fff" } : {}}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>날짜</Text>
              <TouchableOpacity
                style={styles.dateInputBox}
                onPress={() => setShowCalendar(true)}
              >
                <Text>{selectedDate}</Text>
                <Ionicons name="calendar-outline" size={20} color="#AAA" />
              </TouchableOpacity>
            </View>

            {/* ✨ 수정/삭제 공통으로 시간 섹션 표시 */}
            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>
                {requestType === "수정" ? "변경 시간" : "삭제 대상 시간"}
              </Text>
              <View style={styles.timeInputRow}>
                <View style={styles.inputItem}>
                  <TextInput
                    style={[
                      styles.timeInput,
                      requestType === "삭제" && { backgroundColor: "#F5F5F5" },
                    ]}
                    value={startTime}
                    onChangeText={(t) => formatTime(t, setStartTime)}
                    keyboardType="number-pad"
                    maxLength={5}
                    placeholder="09:00"
                    editable={requestType === "수정"} // 삭제일 때는 읽기 전용
                  />
                </View>
                <Text style={{ fontSize: 20 }}>~</Text>
                <View style={styles.inputItem}>
                  <TextInput
                    style={[
                      styles.timeInput,
                      requestType === "삭제" && { backgroundColor: "#F5F5F5" },
                    ]}
                    value={endTime}
                    onChangeText={(t) => formatTime(t, setEndTime)}
                    keyboardType="number-pad"
                    maxLength={5}
                    placeholder="18:00"
                    editable={requestType === "수정"} // 삭제일 때는 읽기 전용
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>사유</Text>
              <TextInput
                style={styles.reasonInput}
                value={reason}
                onChangeText={setReason}
                placeholder="사유를 입력해주세요"
                multiline
              />
            </View>
            <View style={styles.modalBtnGroup}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setRequestModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleRequestSubmit}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>요청 보내기</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <CustomDatePicker
        visible={showCalendar}
        value={selectedDate}
        onDateChange={(d: string) => {
          setSelectedDate(d);
          setShowCalendar(false);
        }}
        onClose={() => setShowCalendar(false)}
      />
      <Footer />
    </View>
  );
};

export default WorkerSchedule;
