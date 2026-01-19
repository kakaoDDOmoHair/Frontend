import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { AddressSearchModal } from '../../../components/common/AddressSearchModal';
import { CustomInput } from '../../../components/common/CustomInput';
import { FormSection } from '../../../components/common/FormSection';
import { SideButton } from '../../../components/common/SideButton';
import { styles } from '../../../styles/tabs/boss/Registration';


export default function StoreRegistrationScreen() {
  useEffect(() => {
    // 🌐 웹 환경에서만 카카오 스크립트 로드
    if (Platform.OS === "web") {
      const script = document.createElement("script");
      script.src =
        "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);
  const [bizType, setBizType] = useState<"normal" | "simple" | null>(null);
  const [address, setAddress] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);

  // 상세 주소창 포커스용 Ref
  const detailAddressRef = useRef<TextInput>(null);

  // ✨ 주소 선택 시 공통으로 실행되는 함수
  const handleAddressSelect = (selectedAddr: string) => {
    setAddress(selectedAddr); // 1. 주소 상태 업데이트
    setIsModalVisible(false); // 2. 모달 닫기

    // 3. 상세 주소창으로 커서 이동
    setTimeout(() => {
      detailAddressRef.current?.focus();
    }, 500);
  };

  // ✨ 주소 검색 버튼 눌렀을 때 실행되는 함수
  const handlePressAddressSearch = () => {
    if (Platform.OS === "web") {
      // 🌐 웹 브라우저일 때: 카카오 팝업 직접 호출
      if (!(window as any).daum) {
        alert("주소 서비스 로딩 중입니다. 잠시 후 다시 시도해주세요.");
        return;
      }
      new (window as any).daum.Postcode({
        oncomplete: (data: any) => {
          handleAddressSelect(data.address);
        },
      }).open();
    } else {
      // 📱 핸드폰/아이패드일 때: WebView 모달 띄우기
      setIsModalVisible(true);
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
        <Ionicons name="notifications-outline" size={24} color="#D1C4E9" />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <FormSection title="기본 정보">
          <Text style={styles.label}>등록번호</Text>
          <CustomInput placeholder="사업자 등록번호를 작성해주세요." />
          <Text style={styles.label}>대표자 성명</Text>
          <CustomInput placeholder="대표자 성명을 작성해주세요." />
          <Text style={styles.label}>개업 연월일</Text>
          <CustomInput placeholder="YYYY-MM-DD" icon="calendar-outline" />

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
                color="#6C5CE7"
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
                color="#6C5CE7"
              />
              <Text style={styles.radioText}>간이 과세자</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.label}>업태/업종</Text>
          <CustomInput placeholder="업종 입력" />
        </FormSection>

        <FormSection title="매장 정보">
          <Text style={styles.label}>
            {/* address가 있으면 주소를 포함한 문구를, 없으면 '미선택' 문구를 완벽히 감싸서 출력합니다. */}
            {address ? `매장 주소 (선택됨: ${address})` : "매장 주소 (미선택)"}
          </Text>
          <View style={styles.rowInput}>
            <View style={{ flex: 1 }}>
              <CustomInput
                placeholder="주소 검색을 이용해주세요."
                value={address} // ✨ 상태값 연결
                editable={false}
              />
            </View>
            <SideButton
              title="주소 검색"
              onPress={handlePressAddressSearch} // ✨ 수정된 함수 연결
            />
          </View>

          <CustomInput
            ref={detailAddressRef}
            placeholder="상세 주소를 입력해 주세요."
          />

          <Text style={styles.label}>매장 Wifi 설정</Text>
          <View style={styles.rowInput}>
            <View style={{ flex: 1 }}>
              <CustomInput placeholder="와이파이를 입력해 주세요." />
            </View>
            <SideButton title="Wifi 등록" />
          </View>
          <Text style={styles.label}>매장 전화번호</Text>
          <CustomInput
            placeholder="매장 전화번호를 입력해 주세요."
            keyboardType="phone-pad"
          />
        </FormSection>

        <FormSection title="은행 정보">
          <Text style={styles.label}>계좌 번호</Text>
          <CustomInput
            placeholder="은행을 선택해주세요."
            icon="chevron-down-outline"
          />
          <CustomInput
            placeholder="계좌번호를 입력해주세요."
            keyboardType="number-pad"
          />
          <View style={styles.rowInput}>
            <View style={{ flex: 1 }}>
              <CustomInput placeholder="실명 확인/인증" />
            </View>
            <SideButton title="인증하기" />
          </View>
        </FormSection>

        <TouchableOpacity style={styles.submitButton}>
          <Text style={{ fontWeight: "bold", fontSize: 16, color: "#000" }}>
            등록하기
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <AddressSearchModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSelect={handleAddressSelect}
      />
    </KeyboardAvoidingView>
  );
}
