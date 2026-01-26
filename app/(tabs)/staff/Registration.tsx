import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import api from "../../../constants/api";

import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BankSelectModal } from "../../../components/common/BankSelectModal";
import { CustomInput } from "../../../components/common/CustomInput";
import { FormSection } from "../../../components/common/FormSection";
import { SideButton } from "../../../components/common/SideButton";
import { styles } from "../../../styles/tabs/staff/Registration";

export default function WorkerRegistrationScreen() {
  const router = useRouter();
  const [notificationCount, setNotificationCount] = useState(5);

  // 1. 입력 상태 관리
  const [inviteCode, setInviteCode] = useState("");
  const [userName, setUserName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [depositorName, setDepositorName] = useState("");
  const [selectedBank, setSelectedBank] = useState({ name: "", code: "" });

  // 2. 인증 및 등록 상태 관리
  const [isVerified, setIsVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");
  const [isAccountRegistered, setIsAccountRegistered] = useState(false);
  const [isBankModalVisible, setIsBankModalVisible] = useState(false);

  // --- API 호출 함수 섹션 ---

  /**
   * [GET] 매장 상세 조회
   * 가입 성공 후 매장의 이름, 위치, 급여 규칙 등을 미리 확인하기 위함
   */
  const fetchStoreDetail = async (storeId: string) => {
    try {
      const response = await api.get(`/api/v1/stores/${storeId}`);
      if (response.status === 200) {
        console.log("가입된 매장 정보:", response.data);
        // 필요 시 전역 상태(Zustand/Context)에 저장하여 대시보드에서 활용
        return response.data;
      }
    } catch (error: any) {
      console.error("매장 상세 조회 실패:", error.response?.data);
    }
  };

  /**
   * [GET] 대시보드 통계 조회
   * 알바생 대시보드에 표시될 총 인건비(본인 급여 등) 및 정산일 정보 확인
   */
  const fetchDashboardStats = async (storeId: string) => {
    try {
      const response = await api.get(`/api/v1/stores/dashboard`, {
        params: {
          storeId: storeId,
          year: 2026, // 현재 연도 기준
          month: 1, // 현재 월 기준
        },
      });
      if (response.status === 200) {
        console.log("대시보드 통계 데이터:", response.data);
      }
    } catch (error: any) {
      console.error("통계 조회 실패:", error.response?.data);
    }
  };

  /**
   * [POST] 계좌 실명 인증
   */
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
          "등록되지 않은 계좌입니다. 테스트 계좌로 등록하시겠습니까?",
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

  const registerFakeAccount = async () => {
    try {
      await api.post("/api/v1/auth/test/register", {
        bankName: selectedBank.name,
        accountNumber: accountNumber,
        ownerName: depositorName,
      });
      Alert.alert("성공", "테스트 계좌가 등록되었습니다. 다시 인증해 주세요.");
      handleVerifyAccount();
    } catch (e) {
      Alert.alert("오류", "테스트 계좌 등록 실패");
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

  /**
   * [POST] 매장 가입 최종 제출
   */
  const handleSubmit = async () => {
    if (!inviteCode) {
      Alert.alert("알림", "초대코드를 입력해주세요.");
      return;
    }
    if (!isAccountRegistered) {
      Alert.alert("알림", "계좌 정보 확인(등록)을 완료해주세요.");
      return;
    }

    const requestBody = {
      userId: 1, // 실제 환경에선 로그인된 유저 고유 ID 사용
      inviteCode: inviteCode,
    };

    try {
      const response = await api.post("/api/v1/stores/join", requestBody);

      if (response.status === 200 || response.status === 201) {
        // 응답 문자열에서 Store ID 추출 (예: "매장 가입 성공! Store ID: 1")
        const storeIdMatch = response.data.match(/ID: (\d+)/);
        const storeId = storeIdMatch ? storeIdMatch[1] : null;

        Alert.alert("가입 성공", response.data, [
          {
            text: "확인",
            onPress: async () => {
              if (storeId) {
                // 가입 성공 직후 매장 상세 및 통계를 미리 조회(초기화)
                await fetchStoreDetail(storeId);
                await fetchDashboardStats(storeId);
              }
              // 대시보드로 이동
              router.replace("/(tabs)/staff/Dashboard");
            },
          },
        ]);
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        Alert.alert("오류", "이미 해당 매장에 가입되어 있습니다.");
      } else {
        Alert.alert(
          "가입 실패",
          error.response?.data?.message || "서버 오류 발생",
        );
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/staff/Notification")}
        >
          <Ionicons name="notifications" size={24} color="#D1C4E9" />
          {notificationCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notificationCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <FormSection title="초대 정보">
          <Text style={styles.label}>초대코드</Text>
          <CustomInput
            placeholder="전달받은 초대코드를 입력하세요"
            value={inviteCode}
            onChangeText={setInviteCode}
            autoCapitalize="characters"
          />
        </FormSection>

        <FormSection title="기본 정보 및 계좌">
          <Text style={styles.label}>이름</Text>
          <CustomInput
            placeholder="이름을 작성해 주세요."
            value={userName}
            onChangeText={setUserName}
            editable={!isAccountRegistered}
          />

          <Text style={styles.label}>생년월일</Text>
          <CustomInput
            placeholder="생년월일 6자리 (예: 990101)"
            keyboardType="number-pad"
            value={birthDate}
            maxLength={6}
            onChangeText={setBirthDate}
            editable={!isAccountRegistered}
          />

          <Text style={styles.label}>계좌번호</Text>
          <TouchableOpacity
            onPress={() => !isVerified && setIsBankModalVisible(true)}
          >
            <View pointerEvents="none">
              <CustomInput
                placeholder="은행 선택"
                icon="chevron-down-outline"
                value={selectedBank.name}
                editable={false}
              />
            </View>
          </TouchableOpacity>

          <CustomInput
            placeholder="계좌번호 (하이픈 없이 작성)"
            keyboardType="number-pad"
            value={accountNumber}
            onChangeText={(t) => {
              setAccountNumber(t);
              setIsVerified(false);
              setIsAccountRegistered(false);
            }}
            editable={!isVerified}
          />

          <View style={{ flexDirection: "row", marginTop: 10, gap: 8 }}>
            <View style={{ flex: 1.5 }}>
              <CustomInput
                placeholder="예금주명"
                value={depositorName}
                onChangeText={(t) => {
                  setDepositorName(t);
                  setIsVerified(false);
                  setIsAccountRegistered(false);
                }}
                editable={!isVerified}
              />
            </View>
            <SideButton
              title={isVerified ? "인증됨" : "인증하기"}
              onPress={handleVerifyAccount}
              style={{
                backgroundColor: isVerified ? "#CCC" : "#6C5CE7",
                flex: 1,
              }}
            />
            <SideButton
              title={isAccountRegistered ? "완료" : "등록"}
              onPress={handleRegisterAccountInfo}
              style={{
                backgroundColor: isAccountRegistered ? "#E0E0E0" : "#6C5CE7",
                flex: 1,
              }}
            />
          </View>
        </FormSection>

        <BankSelectModal
          visible={isBankModalVisible}
          onClose={() => setIsBankModalVisible(false)}
          onSelect={(bank) => {
            setSelectedBank(bank);
            setIsBankModalVisible(false);
          }}
        />

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!isAccountRegistered || !inviteCode) && {
                backgroundColor: "#CCC",
              },
            ]}
            onPress={handleSubmit}
            disabled={!isAccountRegistered || !inviteCode}
          >
            <Text style={styles.submitButtonText}>매장 가입 완료</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
