import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import CustomDatePicker from "../../../components/common/CustomDatePicker";
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
  const activeTabName = "출퇴근관리";
  const today = new Date().toISOString().split("T")[0]; // ✨ 1. 오늘 날짜 체크용

  // --- 상태 관리 ---
  const [selectedDate, setSelectedDate] = useState("2026-01-21");
  const [showCalendar, setShowCalendar] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false); // 근무 등록 모달
  const [showDetailModal, setShowDetailModal] = useState(false); // ✨ 3. 상세 정보 모달

  // 입력 데이터 상태
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [breakTime, setBreakTime] = useState("");

  // 요청 모달 상태
  const [showRequestMenu, setShowRequestMenu] = useState(false);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [requestType, setRequestType] = useState<"수정" | "삭제">("수정");
  const [category, setCategory] = useState<"등록된 근무" | "기록된 근무">(
    "등록된 근무",
  );
  const [reason, setReason] = useState("");

  const [workHistory, setWorkHistory] = useState<WorkData[]>([
    {
      id: 1,
      date: "2026-01-13",
      startTime: "12:00",
      endTime: "18:00",
      breakTime: "30",
      registeredTime: "12:00~18:00",
      wifiTime: "14:00~18:00",
      isPlanned: false,
      storeName: "메가커피 제주연동점",
    },
    {
      id: 2,
      date: "2026-01-24",
      startTime: "13:00",
      endTime: "18:00",
      breakTime: "30",
      registeredTime: "12:00~18:00",
      wifiTime: "",
      isPlanned: true,
      storeName: "메가커피 제주연동점",
    },
  ]);

  // 시간 자동 포맷팅 (HH:mm)
  const formatTime = (text: string, setter: (val: string) => void) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    let formatted = cleaned;
    if (cleaned.length >= 3)
      formatted = `${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`;
    setter(formatted.slice(0, 5));
  };

  // 근무 등록 저장
  const handleSave = () => {
    const newWork: WorkData = {
      id: Date.now(),
      date: selectedDate,
      startTime,
      endTime,
      breakTime,
      registeredTime: `${startTime}~${endTime}`,
      wifiTime: "",
      isPlanned: new Date(selectedDate) > new Date(today), // ✨ 오늘 이후면 예정
      storeName: "",
    };
    setWorkHistory((prev) => {
      const updatedList = [...prev, newWork];
      return updatedList.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
    });
    setShowActionModal(false);
  };

  // ✨ 2. 배지 상태별 색상 및 실제 근무 시간 계산
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

  const selectedWorkDetail = workHistory.find((w) => w.date === selectedDate);

  const shiftDate = (days: number) => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + days);

    // yyyy-mm-dd 형식으로 변환하여 상태 업데이트
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");

    setSelectedDate(`${year}-${month}-${day}`);
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
          {workHistory
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            )
            .map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.dateCell}>
                  {item.date.split("-")[1]}월 {item.date.split("-")[2]}일
                </Text>
                <Text style={styles.timeCell}>{item.registeredTime}</Text>
                <Text
                  style={[
                    styles.timeCell,
                    { color: getBadgeInfo(item.date)?.color },
                  ]}
                >
                  {item.isPlanned ? "-" : item.wifiTime || "-"}
                </Text>
              </View>
            ))}
        </View>

        <View style={styles.calendarWrapper}>
          <Calendar
            current={selectedDate}
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
              textMonthFontSize: 20,
              monthTextColor: "#333",
            }}
            style={{ borderRadius: 20 }}
            dayComponent={({ date }: any) => {
              const badge = getBadgeInfo(date.dateString);
              const isToday = date.dateString === today; // ✨ 1. 오늘 날짜 체크
              return (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedDate(date.dateString);
                    setShowDetailModal(true);
                  }} // ✨ 3. 상세 정보 오픈
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

      {/* ✨ 3. 날짜 클릭 상세 정보 모달 */}
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
              {/* ✨ 매장명 표시: 데이터가 있으면 storeName을, 없으면 안내 문구를 표시 */}
              <Text style={styles.storeName}>
                {selectedWorkDetail
                  ? selectedWorkDetail.storeName
                  : "매장 정보 없음"}
              </Text>

              {selectedWorkDetail ? (
                <>
                  <Text style={styles.detailTimeText}>
                    {selectedWorkDetail.startTime} ~{" "}
                    {selectedWorkDetail.endTime}
                  </Text>
                  <Text style={styles.detailSubText}>
                    (휴게시간: {selectedWorkDetail.breakTime}분)
                  </Text>
                  <View
                    style={[
                      styles.badge,
                      { alignSelf: "center", marginTop: 10 },
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {getBadgeInfo(selectedDate)?.label}
                    </Text>
                  </View>
                </>
              ) : (
                <Text style={styles.noWorkText}>
                  해당 날짜에 근무 기록이 없습니다.
                </Text>
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

      {/* 4. 근무 등록 모달 (근무 추가 연결) */}
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
                <Text style={styles.submitBtnText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 수정/삭제 요청 모달 */}
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
                  <Text>{item}</Text>
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
            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>시간</Text>
              <View style={styles.timeInputRow}>
                <View style={styles.inputItem}>
                  <TextInput
                    style={styles.timeInput}
                    value={startTime}
                    onChangeText={(t) => formatTime(t, setStartTime)}
                    keyboardType="number-pad"
                    maxLength={5}
                    placeholder="12:00"
                  />
                </View>
                <Text>~</Text>
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
              <Text style={styles.inputLabel}>이유</Text>
              <TextInput
                style={styles.reasonInput}
                value={reason}
                onChangeText={setReason}
                placeholder="사유를 입력해주세요"
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
                onPress={() => setRequestModalVisible(false)}
              >
                <Text style={styles.submitBtnText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 공통 날짜 선택 팝업 */}
      <CustomDatePicker
        visible={showCalendar}
        value={selectedDate}
        onDateChange={(d: string) => {
          setSelectedDate(d);
          setShowCalendar(false);
        }}
        onClose={() => setShowCalendar(false)}
      />
    </View>
  );
};

export default WorkerSchedule;
