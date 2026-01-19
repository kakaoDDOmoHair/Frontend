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
import { CustomInput } from "../../../components/common/CustomInput";
import { FormSection } from '../../../components/common/FormSection';
// 🚨 경로 수정: boss -> staff로 변경해야 authRow, authBtn 스타일을 인식합니다.
import { styles } from '../../../styles/tabs/staff/Registration';

export default function WorkerRegistrationScreen() {
  const router = useRouter();
  const [notificationCount, setNotificationCount] = useState(5);

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
          <CustomInput placeholder="이름을 작성해 주세요." />

          <Text style={styles.label}>전화번호</Text>
          <CustomInput
            placeholder="전화번호를 작성해 주세요."
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>계좌번호</Text>
          <CustomInput
            placeholder="은행 선택"
            icon="chevron-down-outline"
            editable={false}
          />
          <CustomInput
            placeholder="계좌번호 (하이픈 없이 작성)"
            keyboardType="number-pad"
          />

          {/* 이제 styles/tabs/staff/Registration.ts의 스타일을 정상적으로 읽어옵니다. */}
          <View style={styles.authRow}>
            <View style={{ flex: 1 }}>
              <CustomInput placeholder="실명 확인/인증" editable={false} />
            </View>
            <TouchableOpacity style={styles.authBtn} activeOpacity={0.8}>
              <Text style={styles.authBtnText}>인증하기</Text>
            </TouchableOpacity>
          </View>
        </FormSection>

        {/* 하단 등록 버튼 영역 */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitButton} activeOpacity={0.8}>
            <Text style={styles.submitButtonText}>등록하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}