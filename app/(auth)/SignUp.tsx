import { CustomButton } from '@/components/common/CustomButton';
import { CustomInput } from '@/components/common/CustomInput';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Keyboard, Platform, Text, TouchableOpacity, View } from 'react-native';
import { styles } from './SignUp.styles';
export default function SignUpScreen() {
  const router = useRouter();
  
  // 입력값 상태 관리
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'boss' | 'staff' | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  // 웹/모바일 통합 알림 함수
  const showAlert = (message: string) => {
    if (Platform.OS === 'web') {
      alert(message);
    } else {
      Alert.alert('알림', message);
    }
  };

  const handleSignUp = () => {
    Keyboard.dismiss(); // 버튼 누르면 키보드 닫기

    // 1. 아이디 입력 여부 확인
    if (id.trim() === "") {
      showAlert("아이디를 입력해주세요.");
      return;
    }

    // 2. 비밀번호 검사
    if (password.trim() === "") {
      showAlert("비밀번호를 입력해주세요.");
      return;
    }
    
    const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/;
    if (!passwordRegex.test(password)) {
      showAlert("비밀번호는 영문, 숫자, 특수문자만 사용 가능합니다.");
      return;
    }
    
    if (password.length < 8) {
      showAlert("비밀번호는 최소 8자 이상이어야 합니다.");
      return;
    }

    // 3. ✨ 이메일 유효성 검사 (정규표현식 수정)
    // 네이버뿐만 아니라 모든 일반적인 이메일 형식을 허용합니다.
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (email.trim() === "") {
      showAlert("이메일 주소를 입력해주세요.");
      return;
    }
    
    if (!emailRegex.test(email)) {
      showAlert("올바른 이메일 형식이 아닙니다. (예: user@example.com)");
      return;
    }

    // 4. 역할 선택 확인
    if (!role) {
      showAlert("사장님 또는 아르바이트생을 선택해주세요.");
      return;
    }
    
    // 모든 통과 시 가입 성공 로직
    console.log(`${role === 'boss' ? '사장님' : '아르바이트생'} 가입 정보:`, { id, email });
    showAlert("회원가입이 완료되었습니다!");
    router.replace('/(auth)/Login'); 
  };

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        
        {/* 로고 영역 */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('@/assets/images/logo.png')} 
            style={styles.logoImage} 
          />
        </View>

        {/* 입력 영역 */}
        <View style={styles.inputContainer}>
          <CustomInput placeholder="아이디" value={id} onChangeText={setId} />
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
            style={[styles.roleButton, role === 'boss' && styles.selectedRoleButton]}
            onPress={() => setRole('boss')}
          >
            <Text style={[styles.roleButtonText, role === 'boss' && styles.selectedRoleButtonText]}>사장님</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.roleButton, role === 'staff' && styles.selectedRoleButton]}
            onPress={() => setRole('staff')}
          >
            <Text style={[styles.roleButtonText, role === 'staff' && styles.selectedRoleButtonText]}>아르바이트생</Text>
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