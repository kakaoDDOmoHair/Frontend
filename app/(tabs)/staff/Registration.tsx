import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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
  const [userName, setUserName] = useState(""); // 이름
  const [birthDate, setBirthDate] = useState(""); // 생년월일
  const [depositorName, setDepositorName] = useState(""); // 예금주명
  const [ownerName, setOwnerName] = useState(""); // 예금주명
  const [accountNumber, setAccountNumber] = useState(""); // 계좌번호
  const [selectedBank, setSelectedBank] = useState({ name: "", code: "" }); // 선택된 은행
  const [isBankModalVisible, setIsBankModalVisible] = useState(false); // 은행 모달 제어
  const [isVerified, setIsVerified] = useState(false); // 인증 여부
  const [verificationToken, setVerificationToken] = useState(""); // 인증 토큰 저장

  const handleSubmit = async () => {
    // 1. 전송할 데이터 객체 생성 (명세서의 '입력 데이터' 양식과 일치시킴)
    const requestData = {
      ownerName: userName, // 이름 상태값
      birthDate: birthDate, // 생년월일 상태값
      bankCode: selectedBank.code, // 선택된 은행 코드
      accountNumber: accountNumber, // 계좌번호 상태값
      verificationToken: verificationToken, // 인증 토큰
    };

    try {
      // 2. 백엔드 API 호출 (Bearer Token 포함 필수)
      // const response = await axios.post('/api/v1/stores', requestData, {
      //   headers: { Authorization: `Bearer ${userToken}` }
      // });

      console.log("백엔드로 보낼 데이터:", requestData);
      alert("매장 등록 요청을 보냈습니다!");
    } catch (error) {
      alert("등록 중 오류가 발생했습니다.");
    }
  };
  const handleVerifyAccount = async () => {
    // 1. 비교할 때 양쪽 다 .trim()을 확실히 붙여주세요.
    const currentName = userName.trim();
    const currentDepositor = depositorName.trim();

    // 💡 디버깅: 여기서 값이 진짜 어떻게 찍히는지 꼭 확인해 보세요!
    console.log("비교값 1 (이름):", `"${currentName}"`);
    console.log("비교값 2 (예금주):", `"${currentDepositor}"`);

    // 2. 만약 이름은 썼는데 예금주명이 아직 안 따라왔다면? 직접 넣어줍니다.
    if (currentName !== "" && currentDepositor === "") {
      setDepositorName(currentName); // 바구니 채워주기
      // 아래 비교 로직에서 오류가 안 나도록 바로 currentName을 사용합니다.
    }

    if (currentName !== currentDepositor) {
      alert(
        "입력하신 '이름'과 '예금주명'이 일치하지 않습니다. 본인 명의의 계좌만 인증 가능합니다.",
      );
      return; // 멈춤
    }

    try {
      // 3. 일치할 때만 실행되는 로직
      // const res = await axios.post(...);
      setIsVerified(true);
      alert("실명 인증에 성공했습니다.");
    } catch (error) {
      alert("은행 정보와 일치하지 않습니다.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* 공통 헤더 */}
      <View style={styles.header}>
        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity
          activeOpacity={0.7}
          // 알바생용 알림 센터 경로로 수정 (필요 시)
          onPress={() => router.push("/(tabs)/staff/Notification")}
          style={styles.notificationBtn}
        >
          <Ionicons name="notifications" size={24} color="#D1C4E9" />
          {notificationCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {notificationCount > 99 ? "99+" : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ScrollView를 추가하여 입력창이 많아져도 화면이 잘리지 않게 합니다. */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <FormSection title="기본 정보">
          <Text style={styles.label}>이름</Text>
          <CustomInput
            placeholder="이름을 작성해 주세요."
            value={userName}
            onChangeText={setUserName} // ✨ 이름 저장
            editable={!isVerified}
          />

          <Text style={styles.label}>생년월일</Text>
          <CustomInput
            placeholder="생년월일 6자리를 입력해 주세요. (예: 990101)"
            keyboardType="number-pad" // 숫자 키패드 권장
            value={birthDate} // 분리된 상태값 사용
            maxLength={6} // 6자리로 제한
            onChangeText={setBirthDate} // 상태 업데이트
            editable={!isVerified} // 인증 후 수정 불가 여부는 기획에 따라 선택
          />

          <Text style={styles.label}>계좌번호</Text>
          {/* 은행 선택 */}
          <TouchableOpacity
            onPress={() => !isVerified && setIsBankModalVisible(true)}
          >
            <View pointerEvents="none">
              <CustomInput
                placeholder="은행 선택"
                icon="chevron-down-outline"
                value={selectedBank.name} // ✨ 선택된 은행 이름 표시
                editable={false}
              />
            </View>
          </TouchableOpacity>

          {/* 계좌번호 입력 */}
          <CustomInput
            placeholder="계좌번호 (하이픈 없이 작성)"
            keyboardType="number-pad"
            value={accountNumber}
            onChangeText={setAccountNumber} // ✨ 계좌번호 저장
            editable={!isVerified}
          />

          {/* 실명 인증 로우 */}
          <View style={styles.authRow}>
            <View style={{ flex: 1 }}>
              <CustomInput
                placeholder="예금주명"
                // 인증이 완료되면 "인증 완료"를 보여주고, 아니면 사용자가 입력한 값을 보여줌
                value={isVerified ? "인증 완료" : ownerName}
                onChangeText={(text) => !isVerified && setOwnerName(text)} // 인증 전까지만 입력 가능
                editable={!isVerified} // 인증 완료 후에는 수정 불가하게 설정
              />
            </View>
            <SideButton
              title={isVerified ? "완료" : "인증하기"} // ✨ 상태에 따라 텍스트 변경
              onPress={handleVerifyAccount}
              disabled={isVerified} // ✨ 인증 완료 후에는 클릭 방지
              style={{
                backgroundColor: isVerified ? "#E0E0E0" : "#6C5CE7",
                width: 100,
              }}
            />
          </View>
        </FormSection>

        {/* 은행 선택 모달 */}
        <BankSelectModal
          visible={isBankModalVisible}
          onClose={() => setIsBankModalVisible(false)}
          onSelect={(bank) => {
            setSelectedBank(bank);
            setIsBankModalVisible(false);
          }}
        />

        {/* 하단 등록 버튼 영역 */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, !isVerified && { opacity: 0.5 }]}
            onPress={handleSubmit}
            disabled={!isVerified} // 인증 안 되면 클릭 불가
          >
            <Text style={styles.submitButtonText}>등록하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
