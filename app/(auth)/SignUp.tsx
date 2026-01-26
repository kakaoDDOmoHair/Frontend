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

  // 서버 Enum 기준에 맞춰 "OWNER" | "WORKER"로 변경
  const [role, setRole] = useState<"OWNER" | "WORKER" | null>(null);
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

    // --- 유효성 검사 ---
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

    // --- API 호출 ---
    try {
      setIsLoading(true);

      const response = await api.post("/api/v1/users/join", {
        username: id,
        password: password,
        name: name,
        email: email,
        role: role, // ✅ "OWNER" 또는 "WORKER"가 그대로 전송됨
      });

      if (response.status === 200 || response.status === 201) {
        showAlert("회원가입이 완료되었습니다!");

        // 역할에 따른 페이지 이동
        if (role === "OWNER") {
          router.replace("/(tabs)/boss/Registration");
        } else {
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
            autoCapitalize="none"
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
              role === "OWNER" && styles.selectedRoleButton,
            ]}
            onPress={() => setRole("OWNER")}
          >
            <Text
              style={[
                styles.roleButtonText,
                role === "OWNER" && styles.selectedRoleButtonText,
              ]}
            >
              사장님
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleButton,
              role === "WORKER" && styles.selectedRoleButton,
            ]}
            onPress={() => setRole("WORKER")}
          >
            <Text
              style={[
                styles.roleButtonText,
                role === "WORKER" && styles.selectedRoleButtonText,
              ]}
            >
              아르바이트생
            </Text>
          </TouchableOpacity>
        </View>

        {/* 가입 버튼 */}
        <View style={styles.submitButtonContainer}>
          <TouchableOpacity disabled={isLoading} onPress={handleSignUp}>
            <CustomButton
              title={isLoading ? "처리 중..." : "가입하기"}
              onPress={handleSignUp}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
