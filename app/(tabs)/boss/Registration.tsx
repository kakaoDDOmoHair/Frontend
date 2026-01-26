import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import api from "../../../constants/api";

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
  const [businessNumber, setBusinessNumber] = useState("");
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

  const [selectedBank, setSelectedBank] = useState({ name: "", code: "" });
  const [accountNumber, setAccountNumber] = useState("");
  const [depositorName, setDepositorName] = useState("");

  const [isVerified, setIsVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");
  const [isAccountRegistered, setIsAccountRegistered] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isSalaryDatePickerVisible, setIsSalaryDatePickerVisible] =
    useState(false);
  const [isBankModalVisible, setIsBankModalVisible] = useState(false);

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
        }
      }
    } catch (e) {
      Alert.alert("오류", "정보를 불러오는 중 문제가 발생했습니다.");
    }
  };

  // 가짜 계좌 데이터 선등록 (테스트용)
  const registerFakeAccount = async () => {
    try {
      await api.post("/api/v1/auth/test/register", {
        bankName: selectedBank.name,
        accountNumber: accountNumber,
        ownerName: depositorName,
      });
      Alert.alert(
        "테스트 데이터 등록",
        "서버에 테스트 계좌가 등록되었습니다. 다시 인증합니다.",
      );
      handleVerifyAccount();
    } catch (e) {
      Alert.alert("오류", "테스트 데이터 등록에 실패했습니다.");
    }
  };

  // 3. 계좌 실명 인증
  const handleVerifyAccount = async () => {
    if (!selectedBank.name || !accountNumber || !depositorName) {
      Alert.alert("오류", "은행 정보와 계좌번호, 예금주명을 확인해주세요.");
      return;
    }

    try {
      const response = await api.post("/api/v1/auth/verify-account", {
        bankName: selectedBank.name,
        accountNumber: accountNumber,
        ownerName: depositorName,
      });

      if (response.data && response.data.verificationToken) {
        setVerificationToken(response.data.verificationToken);
        setIsVerified(true);
        Alert.alert("성공", "계좌 실명 인증이 완료되었습니다.");
      }
    } catch (error: any) {
      const serverMsg = error.response?.data?.message || "";
      if (serverMsg.includes("존재하지 않는")) {
        Alert.alert(
          "인증 실패",
          "서버 가짜 DB에 없는 계좌입니다. 등록하시겠습니까?",
          [
            { text: "취소", style: "cancel" },
            { text: "등록 후 인증", onPress: registerFakeAccount },
          ],
        );
      } else {
        Alert.alert("인증 실패", serverMsg || "서버와 연결할 수 없습니다.");
      }
      setIsVerified(false);
    }
  };

  const handleRegisterAccountInfo = () => {
    if (!isVerified) {
      Alert.alert("알림", "계좌 인증을 먼저 완료해주세요.");
      return;
    }
    setIsAccountRegistered(true);
    Alert.alert("성공", "계좌 정보가 확인되었습니다.");
  };

  // 4. 최종 매장 등록
  const handleSubmit = async () => {
    if (!isAccountRegistered) {
      Alert.alert("알림", "계좌 정보 확인을 완료해주세요.");
      return;
    }

    const formattedOpenDate = openDate.replace(/\./g, "-");
    const payDayNumber = salaryDate ? parseInt(salaryDate.split("-")[2]) : 10;

    const requestBody = {
      userId: 1,
      businessNumber,
      ownerName,
      storeName,
      category: "카페",
      address: addr,
      detailAddress,
      openingDate: formattedOpenDate,
      storePhone: "064-123-4567",
      wifiInfo: wifiName || "Jeju_Wifi",
      payDay: payDayNumber,
      payRule: salaryType === "월급" ? "MONTHLY" : "WEEKLY",
      bankName: selectedBank.name,
      accountNumber,
      inviteCode: "WELCOME2",
      taxType: businessType === "일반" ? "GENERAL" : "SIMPLE",
      verificationToken,
    };

    try {
      const response = await api.post("/api/v1/stores", requestBody);
      if (response.status === 200 || response.status === 201) {
        Alert.alert("성공", "매장 등록이 완료되었습니다!", [
          {
            text: "확인",
            onPress: () => router.replace("/(tabs)/boss/Dashboard"),
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert("등록 실패", error.response?.data?.message || "서버 오류");
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
        <FormSection title="기본 정보">
          <Text style={styles.label}>사업자 번호</Text>
          <CustomInput
            placeholder="사업자 번호"
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
            placeholder="매장명"
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
        </FormSection>

        <View
          style={{ opacity: isStep1Complete ? 1 : 0.4 }}
          pointerEvents={isStep1Complete ? "auto" : "none"}
        >
          <FormSection title="매장 정보">
            <View style={styles.rowInput}>
              <View style={{ flex: 1 }}>
                <CustomInput placeholder="주소" value={addr} editable={false} />
              </View>
              <SideButton
                title="검색"
                onPress={() => setIsModalVisible(true)}
              />
            </View>
            <CustomInput
              ref={detailAddressRef}
              placeholder="상세주소"
              value={detailAddress}
              onChangeText={setDetailAddress}
            />
            <Text style={styles.label}>매장 Wifi</Text>
            <View style={styles.rowInput}>
              <View style={{ flex: 1 }}>
                <CustomInput
                  placeholder="와이파이"
                  value={wifiName}
                  onChangeText={setWifiName}
                />
              </View>
              <SideButton title="불러오기" onPress={fetchCurrentWifi} />
            </View>
          </FormSection>
        </View>

        <View
          style={{ opacity: isStep2Complete ? 1 : 0.4 }}
          pointerEvents={isStep2Complete ? "auto" : "none"}
        >
          <FormSection title="은행 정보">
            <Text style={styles.label}>급여 정산일</Text>
            <TouchableOpacity
              onPress={() => setIsSalaryDatePickerVisible(true)}
            >
              <View pointerEvents="none">
                <CustomInput
                  placeholder="날짜 선택"
                  value={salaryDate}
                  icon="calendar-outline"
                  editable={false}
                />
              </View>
            </TouchableOpacity>

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
              onChangeText={(t) => {
                setAccountNumber(t);
                setIsVerified(false);
              }}
              keyboardType="number-pad"
              editable={!isVerified}
            />
            <View style={styles.rowInput}>
              <View style={{ flex: 1.5 }}>
                <CustomInput
                  placeholder="예금주명"
                  value={depositorName}
                  onChangeText={(t) => {
                    setDepositorName(t);
                    setIsVerified(false);
                  }}
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

      <AddressSearchModal
        visible={isModalVisible}
        onSelect={(d: any) => {
          setAddr(d.address || d);
          setIsModalVisible(false);
        }}
        onClose={() => setIsModalVisible(false)}
      />
      <BankSelectModal
        visible={isBankModalVisible}
        onSelect={(b) => {
          setSelectedBank(b);
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
