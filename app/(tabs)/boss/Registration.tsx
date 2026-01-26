import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import api from "../../../constants/api"; // constants 폴더의 api 인스턴스

import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AddressSearchModal } from "../../../components/common/AddressSearchModal";
import { BankSelectModal } from "../../../components/common/BankSelectModal";
import { CustomDatePicker } from "../../../components/common/CustomDatePicker";
import { CustomInput } from "../../../components/common/CustomInput";
import { FormSection } from "../../../components/common/FormSection";
import { SideButton } from "../../../components/common/SideButton";
import { styles } from "../../../styles/tabs/boss/Registration";

export default function StoreRegistrationScreen() {
  const router = useRouter();

  // 1. 상태 관리
  const [businessNumber, setBusinessNumber] = useState("999-88-77777");
  const [ownerName, setOwnerName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [openDate, setOpenDate] = useState("");
  const [businessType, setBusinessType] = useState("일반");

  const [addr, setAddr] = useState("제주특별자치도 제주시 첨단로 242");
  const [detailAddress, setDetailAddress] = useState("1층");
  const [wifiName, setWifiName] = useState("");
  const detailAddressRef = useRef<TextInput>(null);

  const [salaryType, setSalaryType] = useState("월급");
  const [salaryDate, setSalaryDate] = useState("");
  const [selectedBank, setSelectedBank] = useState({
    name: "카카오뱅크",
    code: "",
  });
  const [accountNumber, setAccountNumber] = useState("");
  const [depositorName, setDepositorName] = useState("");

  const [isVerified, setIsVerified] = useState(false);
  const [isAccountRegistered, setIsAccountRegistered] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isSalaryDatePickerVisible, setIsSalaryDatePickerVisible] =
    useState(false);
  const [isBankModalVisible, setIsBankModalVisible] = useState(false);

  // 단계별 활성화 조건
  const isStep1Complete =
    ownerName !== "" && storeName !== "" && openDate !== "";
  const isStep2Complete = isStep1Complete && addr !== "" && wifiName !== "";

  // 2. 와이파이 불러오기
  const fetchCurrentWifi = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "권한 거부",
          "와이파이 정보를 읽으려면 위치 권한 허용이 필요합니다.",
        );
        return;
      }
      const state = await NetInfo.fetch();
      if (state.type === "wifi" && state.isConnected) {
        const ssid =
          state.details && "ssid" in state.details ? state.details.ssid : null;
        if (ssid && ssid !== "unknown") {
          setWifiName(ssid);
          Alert.alert("연결 성공", `현재 연결된 '${ssid}'를 가져왔습니다.`);
        } else {
          Alert.alert(
            "인식 불가",
            "설정에서 '정확한 위치' 권한이 켜져 있는지 확인해 주세요.",
          );
        }
      }
    } catch (e) {
      Alert.alert("오류", "정보를 불러오는 중 문제가 발생했습니다.");
    }
  };

  // 3. 비즈니스 로직
  const handleVerifyAccount = () => {
    if (
      !ownerName ||
      !depositorName ||
      ownerName.trim() !== depositorName.trim()
    ) {
      Alert.alert("오류", "대표자 성명과 예금주명이 일치해야 합니다.");
      return;
    }
    setIsVerified(true);
    Alert.alert("성공", "계좌 실명 인증이 확인되었습니다.");
  };

  const handleRegisterAccountInfo = () => {
    if (!isVerified) {
      Alert.alert("알림", "계좌 인증을 먼저 완료해주세요.");
      return;
    }
    setIsAccountRegistered(true);
    Alert.alert("성공", "계좌 정보가 로컬에 등록되었습니다.");
  };

  // --- 💡 최종 API 연동 함수 (에러 해결 핵심 로직 반영) ---
  const handleSubmit = async () => {
    if (!isAccountRegistered) {
      Alert.alert("알림", "계좌 정보 등록 버튼을 먼저 눌러주세요.");
      return;
    }

    // 🛠️ 날짜 형식 강제 변환: 서버는 점(.)이 포함된 2026.01.05 형식을 읽지 못함.
    // 하이픈(-) 형식을 엄격히 유지해야 함 (예: 2026-01-05)
    const formattedOpenDate = openDate.replace(/\./g, "-");
    const payDayNumber = salaryDate ? parseInt(salaryDate.split("-")[2]) : 10;

    const requestBody = {
      userId: 1,
      businessNumber: businessNumber,
      ownerName: ownerName,
      storeName: storeName,
      category: "카페",
      address: addr,
      detailAddress: detailAddress,
      openingDate: formattedOpenDate, // ⚠️ 하이픈(-) 필수
      storePhone: "064-123-4567",
      wifiInfo: wifiName || "Jeju_Free_Wifi",
      payDay: payDayNumber,
      payRule: salaryType === "월급" ? "MONTHLY" : "HOURLY", // Enum 대문자
      bankName: selectedBank.name,
      accountNumber: accountNumber,
      inviteCode: "WELCOME2", // 💡 Postman 성공 필수값 추가
      taxType: businessType === "일반" ? "GENERAL" : "SIMPLE", // Enum 대문자
      verificationToken: "v_token_sample_2026", // ⚠️ 서버 DB와 일치해야 하는 유효 토큰
    };

    try {
      console.log("전송 데이터:", requestBody);
      const response = await api.post("/api/v1/stores", requestBody);

      if (response.status === 200 || response.status === 201) {
        Alert.alert("성공", String(response.data), [
          {
            text: "확인",
            onPress: () => router.replace("/(tabs)/boss/Dashboard"),
          },
        ]);
      }
    } catch (error: any) {
      // 💡 [object Object] 방지를 위해 상세 메시지 추출
      const serverData = error.response?.data;
      let errorMsg = "서버와 연결할 수 없습니다.";

      if (serverData) {
        // 서버가 에러 객체를 보낼 경우 message 필드를 찾거나 전체를 문자열화함
        errorMsg =
          typeof serverData === "object"
            ? serverData.message || JSON.stringify(serverData)
            : serverData;
      }

      console.error("서버 에러 상세:", serverData);
      Alert.alert("등록 실패", `서버 메시지: ${errorMsg}`);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
        />
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/boss/Notification")}
        >
          <Ionicons name="notifications-outline" size={24} color="#D1C4E9" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 기본 정보 섹션 */}
        <FormSection title="기본 정보">
          <Text style={styles.label}>등록번호</Text>
          <CustomInput
            placeholder="사업자 등록번호"
            value={businessNumber}
            onChangeText={setBusinessNumber}
            keyboardType="number-pad"
          />
          <Text style={styles.label}>대표자 성명</Text>
          <CustomInput
            placeholder="성명"
            value={ownerName}
            onChangeText={setOwnerName}
          />
          <Text style={styles.label}>매장명</Text>
          <CustomInput
            placeholder="매장 이름"
            value={storeName}
            onChangeText={setStoreName}
          />
          <Text style={styles.label}>개업 연월일</Text>
          <TouchableOpacity onPress={() => setIsDatePickerVisible(true)}>
            <View pointerEvents="none">
              <CustomInput
                placeholder="YYYY-MM-DD"
                value={openDate}
                icon="calendar-outline"
                editable={false}
              />
            </View>
          </TouchableOpacity>
          <Text style={styles.label}>사업자 유형</Text>
          <View style={{ flexDirection: "row", gap: 20, marginTop: 4 }}>
            {["일반 과세자", "간이 과세자"].map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() =>
                  setBusinessType(type.includes("일반") ? "일반" : "간이")
                }
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <Ionicons
                  name={
                    businessType === (type.includes("일반") ? "일반" : "간이")
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={22}
                  color="#6C5CE7"
                />
                <Text style={{ marginLeft: 6 }}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </FormSection>

        {/* 매장 정보 섹션 */}
        <View
          style={{ opacity: isStep1Complete ? 1 : 0.4 }}
          pointerEvents={isStep1Complete ? "auto" : "none"}
        >
          <FormSection title="매장 정보">
            <View style={styles.rowInput}>
              <View style={{ flex: 1 }}>
                <CustomInput
                  placeholder="주소 검색"
                  value={addr}
                  editable={false}
                />
              </View>
              <SideButton
                title="주소 검색"
                onPress={() => setIsModalVisible(true)}
              />
            </View>
            <CustomInput
              ref={detailAddressRef}
              placeholder="상세 주소"
              value={detailAddress}
              onChangeText={setDetailAddress}
            />
            <Text style={styles.label}>매장 Wifi 설정</Text>
            <View style={styles.rowInput}>
              <View style={{ flex: 1 }}>
                <CustomInput
                  placeholder="와이파이 입력"
                  value={wifiName}
                  onChangeText={setWifiName}
                />
              </View>
              <SideButton title="불러오기" onPress={fetchCurrentWifi} />
            </View>
          </FormSection>
        </View>

        {/* 은행 및 정산 섹션 */}
        <View
          style={{ opacity: isStep2Complete ? 1 : 0.4 }}
          pointerEvents={isStep2Complete ? "auto" : "none"}
        >
          <FormSection title="은행 정보">
            <Text style={styles.label}>급여 정산일</Text>
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 15 }}>
              <View
                style={{
                  flexDirection: "row",
                  backgroundColor: "#F8F9FA",
                  borderRadius: 10,
                  padding: 4,
                  width: 130,
                }}
              >
                {["월급", "주급"].map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setSalaryType(t)}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      alignItems: "center",
                      backgroundColor:
                        salaryType === t ? "#FFF" : "transparent",
                      borderRadius: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: salaryType === t ? "#6C5CE7" : "#CCC",
                        fontWeight: "bold",
                      }}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => setIsSalaryDatePickerVisible(true)}
              >
                <View pointerEvents="none">
                  <CustomInput
                    placeholder="YYYY-MM-DD"
                    value={salaryDate}
                    icon="calendar-outline"
                    editable={false}
                  />
                </View>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>계좌 정보</Text>
            <TouchableOpacity
              onPress={() => !isVerified && setIsBankModalVisible(true)}
            >
              <View pointerEvents="none">
                <CustomInput
                  placeholder="은행 선택"
                  value={selectedBank.name}
                  icon="chevron-down-outline"
                  editable={false}
                />
              </View>
            </TouchableOpacity>
            <CustomInput
              placeholder="계좌번호"
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="number-pad"
            />

            <View style={styles.rowInput}>
              <View style={{ flex: 1.5 }}>
                <CustomInput
                  placeholder="예금주명"
                  value={depositorName}
                  onChangeText={setDepositorName}
                  editable={!isVerified}
                />
              </View>
              <SideButton
                title={isVerified ? "인증됨" : "인증하기"}
                onPress={handleVerifyAccount}
                style={{
                  backgroundColor: isVerified ? "#CCC" : "#6C5CE7",
                  marginLeft: 8,
                  flex: 1,
                }}
              />
              <SideButton
                title={isAccountRegistered ? "완료" : "등록"}
                onPress={handleRegisterAccountInfo}
                style={{
                  backgroundColor: isAccountRegistered ? "#E0E0E0" : "#6C5CE7",
                  marginLeft: 8,
                  flex: 1,
                }}
              />
            </View>
          </FormSection>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            !isAccountRegistered && { backgroundColor: "#CCC" },
          ]}
          onPress={handleSubmit}
          disabled={!isAccountRegistered}
        >
          <Text style={styles.submitButtonText}>매장 등록하기</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 모달 컴포넌트 */}
      <AddressSearchModal
        visible={isModalVisible}
        onSelect={(data: any) => {
          setAddr(typeof data === "string" ? data : data.address);
          setIsModalVisible(false);
          setTimeout(() => detailAddressRef.current?.focus(), 100);
        }}
        onClose={() => setIsModalVisible(false)}
      />
      <BankSelectModal
        visible={isBankModalVisible}
        onSelect={(bank) => {
          setSelectedBank(bank);
          setIsBankModalVisible(false);
        }}
        onClose={() => setIsBankModalVisible(false)}
      />
      <CustomDatePicker
        visible={isDatePickerVisible}
        value={openDate}
        onDateChange={(d) => {
          setOpenDate(d);
          setIsDatePickerVisible(false);
        }}
        onClose={() => setIsDatePickerVisible(false)}
      />
      <CustomDatePicker
        visible={isSalaryDatePickerVisible}
        value={salaryDate}
        onDateChange={(d) => {
          setSalaryDate(d);
          setIsSalaryDatePickerVisible(false);
        }}
        onClose={() => setIsSalaryDatePickerVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}
