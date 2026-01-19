import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Platform, Text, TouchableOpacity, View } from 'react-native';

import { CustomButton } from '@/components/common/CustomButton';
import { CustomInput } from '@/components/common/CustomInput';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../styles/auth/Login';


export default function LoginScreen() {
  const router = useRouter();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // 🔥 웹/모바일 어디서든 알림이 뜨게 하는 통합 함수
  const showAlert = (message: string) => {
    if (Platform.OS === 'web') {
      alert(message); // 웹 브라우저 환경
    } else {
      Alert.alert('알림', message); // 모바일(iOS/Android) 환경
    }
  };

  const handleLogin = () => {
    // 1. 아이디 입력 여부 확인
    if (id.trim() === "") {
      showAlert("아이디를 입력해주세요.");
      return;
    }

    // 2. 비밀번호 입력 여부 확인
    if (password.trim() === "") {
      showAlert("비밀번호를 입력해주세요.");
      return;
    }

    // 3. 비밀번호 형식 및 길이 검사
    const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/;

    // 길이 검사 (8자 이상)
    if (password.length < 8) {
      showAlert("비밀번호는 최소 8자 이상이어야 합니다.");
      return;
    }

    // 형식 검사 (영문, 숫자, 특수문자 조합)
    if (!passwordRegex.test(password)) {
      showAlert("비밀번호는 영문, 숫자, 특수문자만 사용 가능합니다.");
      return;
    }

    // 4. 모든 검증 통과 시 실행
    console.log('로그인 시도 데이터:', { id, password });
    showAlert(`${id}님 환영합니다!`);
    
    // 성공 시 메인 대시보드로 이동 (로그인 연동 시 주석 해제)
    // router.replace('/(boss)/(tabs)/dashboard');
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

        {/* 입력 영역: 공용 컴포넌트 사용 */}
        <View style={styles.inputContainer}>
          <CustomInput
            placeholder="아이디"
            value={id}
            onChangeText={setId}
          />
          <View style={{ width: '100%', position: 'relative', justifyContent: 'center' }}>
            <CustomInput
              placeholder="비밀번호"
              secureTextEntry={!isPasswordVisible}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity 
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              style={{ position: 'absolute', right: 15, zIndex: 1, padding: 5 }}
            >
              <Ionicons 
                name={isPasswordVisible ? "eye-outline" : "eye-off-outline"} 
                size={22} color="#333" 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* 로그인 버튼: 공용 컴포넌트 사용 */}
        <View style={styles.submitButtonContainer}>
            <CustomButton 
                title="로그인" 
                onPress={() => {
                    handleLogin();
                }} 
            />
        </View>

        {/* 하단 링크 영역 */}
        <View style={styles.linkContainer}>
          <TouchableOpacity onPress={() => router.push('/(auth)/FindId')}><Text style={styles.linkText}>아이디 찾기</Text></TouchableOpacity>
          <Text style={styles.divider}>|</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/FindPw')}><Text style={styles.linkText}>비밀번호 찾기</Text></TouchableOpacity>          
          <Text style={styles.divider}>|</Text>
          <Link href="/SignUp" asChild>
            <TouchableOpacity>
              <Text style={[styles.linkText, { fontWeight: 'bold', color: '#000' }]}>가입하기</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}