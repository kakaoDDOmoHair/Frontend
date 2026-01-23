import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as Network from "expo-network";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
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

  // 1. 상태 관리 (State)
  const [bizType, setBizType] = useState<"normal" | "simple" | null>(null);
  const [address, setAddress] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [wifiName, setWifiName] = useState("");
  const [openDate, setOpenDate] = useState("");
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const detailAddressRef = useRef<TextInput>(null);
  const [isOpenDateVisible, setIsOpenDateVisible] = useState(false); // 개업일 모달
  const [isSettlementVisible, setIsSettlementVisible] = useState(false); // 정산일 모달
  const [isBankModalVisible, setIsBankModalVisible] = useState(false);
  const [selectedBank, setSelectedBank] = useState({ name: "", code: "" });
  const [accountNumber, setAccountNumber] = useState("");
  const [payType, setPayType] = useState("월급");
  const [settlementDate, setSettlementDate] = useState("");

  const [isVerified, setIsVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");

  // ✨ 지운 님의 요청: 이름과 예금주명을 각각 직접 입력받기 위해 독립된 상태로 관리
  const [ownerName, setOwnerName] = useState(""); // 대표자 성명
  const [depositorName, setDepositorName] = useState(""); // 예금주명

  // 2. 계좌 실명 인증 함수
  const handleVerifyAccount = async () => {
    const finalOwner = ownerName.trim(); // 대표자명 공백 제거
    const finalDepositor = depositorName.trim(); // 예금주명 공백 제거

    // 로그를 통해 각 바구니에 값이 정확히 담겼는지 확인합니다.
    console.log("비교값 1 (대표자명):", `"${finalOwner}"`);
    console.log("비교값 2 (예금주명):", `"${finalDepositor}"`);

    // 필수 정보 입력 확인
    if (
      !selectedBank.code ||
      !accountNumber ||
      !finalOwner ||
      !finalDepositor
    ) {
      alert("은행, 계좌번호, 성명 정보를 모두 입력해주세요.");
      return;
    }

    // ✨ 핵심 검증: 대표자명과 예금주명이 글자 하나까지 일치하는지 대조
    if (finalOwner !== finalDepositor) {
      alert(
        "입력하신 '대표자 성명'과 '예금주명'이 일치하지 않습니다. 본인 명의의 계좌만 인증 가능합니다.",
      );
      return; // 일치하지 않으면 아래 인증 성공 로직으로 넘어가지 못하게 차단
    }

    try {
      // (백엔드 연결 시 예시)
      // const res = await axios.post('/api/v1/auth/verify-account', {
      //   bankCode: selectedBank.code,
      //   accountNumber: accountNumber,
      //   ownerName: finalOwner
      // });
      // setVerificationToken(res.data.token);

      setIsVerified(true);
      alert("성함과 예금주명이 일치합니다. 계좌 인증에 성공했습니다!");
    } catch (error) {
      alert("인증에 실패했습니다. 정보를 다시 확인해주세요.");
    }
  };

  // 3. 최종 등록 제출 함수
  const handleSubmit = async () => {
    const requestData = {
      ownerName: ownerName,
      bankCode: selectedBank.code,
      accountNumber: accountNumber,
      verificationToken: verificationToken,
      address: address,
      wifiName: wifiName,
      payType: payType,
      settlementDate: settlementDate,
    };

    console.log("백엔드 전송 데이터:", requestData);
    alert("매장 등록 요청을 보냈습니다!");
  };

  // 4. 와이파이 정보 불러오기
  const fetchCurrentWifi = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("권한 거부", "위치 권한이 필요합니다.");
        return;
      }
      const state: any = await Network.getNetworkStateAsync();
      if (state.isConnected && state.details?.ssid) {
        setWifiName(state.details.ssid);
        Alert.alert("성공", `와이파이(${state.details.ssid})를 불러왔습니다.`);
      } else {
        Alert.alert(
          "안내",
          "와이파이 이름을 읽어오지 못했습니다. 직접 입력해 주세요.",
        );
      }
    } catch (e) {
      Alert.alert("오류", "정보를 불러오는 중 문제가 발생했습니다.");
    }
  };

  // 5. 주소 검색 처리
  // handleAddressSelect를 아래와 같이 수정
  const handleAddressSelect = (selectedAddr: string) => {
    if (!selectedAddr) return; // 주소가 없으면 중단

    setAddress(selectedAddr); // 주소 먼저 저장
    setIsModalVisible(false); // 모달 닫기

    // 모달이 닫히는 애니메이션 시간을 고려해 포커스 이동
    setTimeout(() => {
      detailAddressRef.current?.focus();
    }, 100);
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
          <CustomInput placeholder="사업자 등록번호를 작성해주세요." />

          <Text style={styles.label}>대표자 성명</Text>
          <CustomInput
            placeholder="대표자 성명을 작성해주세요."
            value={ownerName} // 대표자명 바구니 연결
            onChangeText={setOwnerName}
            editable={!isVerified}
          />

          <Text style={styles.label}>개업 연월일</Text>
          <TouchableOpacity onPress={() => setIsDatePickerVisible(true)}>
            <View pointerEvents="none">
              <CustomInput
                placeholder="YYYY-MM-DD"
                value={openDate}
                icon="calendar-outline" // 달력 아이콘 표시
                editable={false} // 직접 타이핑 방지
              />
            </View>
          </TouchableOpacity>

          {/* 날짜 선택 모달 */}
          <CustomDatePicker
            visible={isDatePickerVisible} // 모달 표시 여부 전달
            value={openDate}
            onDateChange={(date) => {
              setOpenDate(date);
              setIsDatePickerVisible(false); // 날짜 선택 시 자동으로 닫기
            }}
            onClose={() => setIsDatePickerVisible(false)} // 닫기 버튼이나 배경 클릭 시
          />

          <Text style={styles.label}>사업자 유형 선택</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={styles.radioItem}
              onPress={() => setBizType("normal")}
            >
              <Ionicons
                name={
                  bizType === "normal" ? "radio-button-on" : "radio-button-off"
                }
                size={20}
                color="#E0D5FF"
              />
              <Text style={styles.radioText}>일반 과세자</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioItem}
              onPress={() => setBizType("simple")}
            >
              <Ionicons
                name={
                  bizType === "simple" ? "radio-button-on" : "radio-button-off"
                }
                size={20}
                color="#E0D5FF"
              />
              <Text style={styles.radioText}>간이 과세자</Text>
            </TouchableOpacity>
          </View>
        </FormSection>

        {/* 매장 정보 섹션 */}
        <FormSection title="매장 정보">
          <View style={styles.rowInput}>
            <View style={{ flex: 1 }}>
              <CustomInput
                placeholder="주소 검색을 이용해주세요."
                value={address}
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
            placeholder="상세 주소를 입력해 주세요."
          />

          <Text style={styles.label}>매장 Wifi 설정</Text>
          <View style={styles.rowInput}>
            <View style={{ flex: 1 }}>
              <CustomInput
                placeholder="와이파이를 입력해 주세요."
                value={wifiName}
                onChangeText={setWifiName}
              />
            </View>
            <SideButton title="불러오기" onPress={fetchCurrentWifi} />
          </View>
        </FormSection>

        {/* 은행 정보 섹션 */}
        <FormSection title="은행 정보">
          <Text style={styles.label}>급여 정산일</Text>
          <View style={styles.row}>
            <View style={styles.payTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.payTypeButton,
                  payType === "월급" && styles.activePayType,
                ]}
                onPress={() => setPayType("월급")}
              >
                <Text
                  style={[
                    styles.payTypeText,
                    payType === "월급" && styles.activePayTypeText,
                  ]}
                >
                  월급
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.payTypeButton,
                  payType === "주급" && styles.activePayType,
                ]}
                onPress={() => setPayType("주급")}
              >
                <Text
                  style={[
                    styles.payTypeText,
                    payType === "주급" && styles.activePayTypeText,
                  ]}
                >
                  주급
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              <TouchableOpacity onPress={() => setIsSettlementVisible(true)}>
                <View pointerEvents="none">
                  <CustomInput
                    placeholder="YYYY-MM-DD"
                    value={settlementDate}
                    icon="calendar-outline"
                    editable={false}
                  />
                </View>
              </TouchableOpacity>

              <CustomDatePicker
                visible={isSettlementVisible}
                value={settlementDate}
                onDateChange={(date) => {
                  setSettlementDate(date);
                  setIsSettlementVisible(false);
                }}
                onClose={() => setIsSettlementVisible(false)} // 에러 해결 포인트!
              />
            </View>
          </View>

          <Text style={styles.label}>계좌 번호</Text>
          <TouchableOpacity
            onPress={() => !isVerified && setIsBankModalVisible(true)}
          >
            <View pointerEvents="none">
              <CustomInput
                placeholder="은행을 선택해주세요."
                value={selectedBank.name}
                icon="chevron-down-outline"
                editable={false}
              />
            </View>
          </TouchableOpacity>

          <CustomInput
            placeholder="계좌번호를 입력해주세요."
            keyboardType="number-pad"
            value={accountNumber}
            onChangeText={setAccountNumber}
            editable={!isVerified}
          />

          <View style={styles.rowInput}>
            <View style={{ flex: 1 }}>
              <CustomInput
                placeholder="예금주명"
                // ✨ 지운 님의 요청: 이름 칸과 별개로 직접 입력받음 (자동 동기화 없음)
                value={isVerified ? "인증 완료" : depositorName}
                onChangeText={(text) => !isVerified && setDepositorName(text)}
                editable={!isVerified}
              />
            </View>
            <SideButton
              title={isVerified ? "완료" : "인증하기"}
              onPress={handleVerifyAccount}
              disabled={isVerified}
              style={{
                backgroundColor: isVerified ? "#E0E0E0" : "#6C5CE7",
                width: 100,
              }}
            />
          </View>
        </FormSection>

        {/* 등록 버튼 */}
        <TouchableOpacity
          style={[styles.submitButton, !isVerified && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={!isVerified}
        >
          <Text style={styles.submitButtonText}>등록하기</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 모달 컴포넌트들 */}
      <BankSelectModal
        visible={isBankModalVisible}
        onClose={() => setIsBankModalVisible(false)}
        onSelect={(bank) => {
          setSelectedBank(bank);
          setIsBankModalVisible(false);
        }}
      />
      <AddressSearchModal
        visible={isModalVisible}
        onSelect={handleAddressSelect} // 이름이 일치하는지 확인
        onClose={() => setIsModalVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}
