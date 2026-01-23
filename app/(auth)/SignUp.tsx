import { CustomButton } from "@/components/common/CustomButton";
import { CustomInput } from "@/components/common/CustomInput";
import api from "@/constants/api";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../../styles/auth/SignUp";

export default function SignUpScreen() {
  const router = useRouter();

  // 입력값 상태 관리
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"boss" | "staff" | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 웹/모바일 통합 알림 함수
  const showAlert = (message: string) => {
    if (Platform.OS === "web") {
      alert(message);
    } else {
      Alert.alert("알림", message);
    }
  };

  const handleSignUp = async () => {
    Keyboard.dismiss();

    // --- 유효성 검사 (기존 로직) ---
    if (id.trim() === "") {
      showAlert("아이디를 입력해주세요.");
      return;
    }
    if (name.trim() === "") {
      showAlert("이름을 입력해주세요.");
      return;
    }
    if (password.trim() === "") {
      showAlert("비밀번호를 입력해주세요.");
      return;
    }

    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      showAlert("비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      showAlert("올바른 이메일 형식이 아닙니다.");
      return;
    }

    if (!role) {
      showAlert("사장님 또는 아르바이트생을 선택해주세요.");
      return;
    }

    // ✅ 3. API 호출 로직 시작
    try {
      setIsLoading(true);

      // 백엔드 엔드포인트와 필드명을 확인하세요.
      // 보통 사장님/알바생 구분을 위해 role을 같이 보냅니다.
      const response = await api.post("/api/v1/users/join", {
        username: id, // 백엔드에서 요구하는 필드명으로 수정 (ex: loginId, email 등)
        password: password,
        name: name,
        email: email,
        role: role.toUpperCase(), // 보통 서버는 대문자(OWNER, STAFF)를 선호합니다.
      });

      if (response.status === 200 || response.status === 201) {
        showAlert("회원가입이 완료되었습니다!");
        // ✅ 역할(role)에 따라 이동 경로 분기 처리
        if (role === "boss") {
          router.replace("/(tabs)/boss/Registration");
        } else if (role === "staff") {
          router.replace("/(tabs)/staff/Registration");
        }
      }
    } catch (error: any) {
      console.error("회원가입 에러:", error.response?.data || error.message);
      const errorMsg =
        error.response?.data?.message || "서버 연결에 실패했습니다.";
      showAlert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        {/* 로고 영역 */}
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logoImage}
          />
        </View>

        {/* 입력 영역 */}
        <View style={styles.inputContainer}>
          <CustomInput placeholder="아이디" value={id} onChangeText={setId} />
          <CustomInput
            placeholder="이름"
            value={name}
            onChangeText={setName}
            autoCapitalize="none" // 영문 이름 입력 시 첫글자 대문자 방지
          />
          <CustomInput
            placeholder="비밀번호"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <CustomInput
            placeholder="이메일"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>

        {/* 역할 선택 영역 */}
        <View style={styles.roleSelectionContainer}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              role === "boss" && styles.selectedRoleButton,
            ]}
            onPress={() => setRole("boss")}
          >
            <Text
              style={[
                styles.roleButtonText,
                role === "boss" && styles.selectedRoleButtonText,
              ]}
            >
              사장님
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleButton,
              role === "staff" && styles.selectedRoleButton,
            ]}
            onPress={() => setRole("staff")}
          >
            <Text
              style={[
                styles.roleButtonText,
                role === "staff" && styles.selectedRoleButtonText,
              ]}
            >
              아르바이트생
            </Text>
          </TouchableOpacity>
        </View>

        {/* 가입 버튼 */}
        <View style={styles.submitButtonContainer}>
          <CustomButton title="가입하기" onPress={handleSignUp} />
        </View>
      </View>
    </View>
  );
}
