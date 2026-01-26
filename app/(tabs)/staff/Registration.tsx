import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import api from "../../../constants/api"; // API 인스턴스 가져오기

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

  // 상태 관리
  const [userName, setUserName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [depositorName, setDepositorName] = useState("");
  const [selectedBank, setSelectedBank] = useState({ name: "", code: "" });

  const [isVerified, setIsVerified] = useState(false); // 실명 인증 여부
  const [verificationToken, setVerificationToken] = useState(""); // 인증 토큰
  const [isAccountRegistered, setIsAccountRegistered] = useState(false); // '등록' 버튼 클릭 여부
  const [isBankModalVisible, setIsBankModalVisible] = useState(false);

  // 💡 가짜 계좌 데이터 선등록 (사장님 코드의 테스트 로직과 동일)
  const registerFakeAccount = async () => {
    try {
      await api.post("/api/v1/auth/test/register", {
        bankName: selectedBank.name,
        accountNumber: accountNumber,
        ownerName: depositorName,
      });
      Alert.alert(
        "테스트 데이터 등록",
        "서버 가짜 DB에 계좌가 등록되었습니다. 다시 인증을 시도합니다.",
      );
      handleVerifyAccount();
    } catch (e) {
      Alert.alert("오류", "테스트 데이터 등록에 실패했습니다.");
    }
  };

  // 💡 계좌 실명 인증 로직 (사장님 코드와 동일하게 수정)
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
          "서버 가짜 DB에 등록되지 않은 계좌입니다. 지금 등록하시겠습니까?",
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

  // 💡 계좌 정보 확인(등록) 버튼
  const handleRegisterAccountInfo = () => {
    if (!isVerified) {
      Alert.alert("알림", "계좌 인증을 먼저 완료해주세요.");
      return;
    }
    setIsAccountRegistered(true);
    Alert.alert("성공", "계좌 정보가 확인되었습니다.");
  };

  // 💡 최종 가입 제출
  const handleSubmit = async () => {
    if (!isAccountRegistered) {
      Alert.alert("알림", "계좌 정보 확인(등록)을 완료해주세요.");
      return;
    }

    const requestData = {
      ownerName: userName,
      birthDate: birthDate,
      bankName: selectedBank.name,
      accountNumber: accountNumber,
      verificationToken: verificationToken,
    };

    try {
      // API 호출 시나리오 (예시: /api/v1/workers/register)
      console.log("최종 전송 데이터:", requestData);
      Alert.alert("성공", "등록이 완료되었습니다!", [
        {
          text: "확인",
          onPress: () => router.replace("/(tabs)/staff/Dashboard"),
        },
      ]);
    } catch (error) {
      Alert.alert("오류", "등록 중 문제가 발생했습니다.");
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
        <FormSection title="기본 정보">
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

          {/* 사장님 코드와 동일한 인증/등록 버튼 레이아웃 */}
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
              !isAccountRegistered && { backgroundColor: "#CCC" },
            ]}
            onPress={handleSubmit}
            disabled={!isAccountRegistered}
          >
            <Text style={styles.submitButtonText}>등록하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
