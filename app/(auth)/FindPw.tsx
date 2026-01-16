import { CustomButton } from '@/components/common/CustomButton';
import { CustomInput } from '@/components/common/CustomInput';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Keyboard, Platform, TouchableOpacity, View } from 'react-native';
import { styles } from './FindId.styles';

export default function FindPasswordScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [id, setId] = useState(''); // 비밀번호 찾기에는 아이디 입력이 필요함
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isPasswordVisible1, setIsPasswordVisible1] = useState(false);
  const [isPasswordVisible2, setIsPasswordVisible2] = useState(false);


  // 상태 관리
  const [isSent, setIsSent] = useState(false); // 메일 발송 여부
  const [isVerified, setIsVerified] = useState(false); // 인증 완료 여부 (새 비번 입력창 표시)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const showAlert = (message: string) => {
    if (Platform.OS === 'web') alert(message);
    else Alert.alert('알림', message);
  };

const handleAction = () => {
    Keyboard.dismiss(); // 버튼 누르면 키보드 즉시 닫기

    if (!isSent) {
      // 1. 각 필드별 구체적인 알림 설정
      if (name.trim() === "") {
        showAlert("이름을 입력해주세요.");
        return;
      }
      if (id.trim() === "") {
        showAlert("아이디를 입력해주세요.");
        return;
      }
      if (email.trim() === "") {
        showAlert("이메일 주소를 입력해주세요.");
        return;
      }

      // 2. 이메일 형식 검사 (추가하면 더 좋습니다)
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        showAlert("올바른 이메일 형식을 입력해주세요.");
        return;
      }

      setIsSent(true);
      showAlert("인증번호가 발송되었습니다.");
      console.log("비밀번호 찾기 인증번호 발송:", { name, id, email });
    } 
    else if (!isVerified) {
      // 인증번호 확인 단계
      if (verificationCode.length !== 6) {
        showAlert("인증번호 6자리를 입력해주세요.");
        return;
      }
      setIsVerified(true);
      showAlert("본인 인증에 성공했습니다.");
    } 
    else {
      // 비밀번호 재설정 단계
      if (newPassword.length < 8) {
        showAlert("비밀번호는 최소 8자 이상이어야 합니다.");
        return;
      }
      if (newPassword !== confirmPassword) {
        showAlert("비밀번호가 일치하지 않습니다.");
        return;
      }
      showAlert("비밀번호가 성공적으로 변경되었습니다.");
      router.replace('/(auth)/Login');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        {/* 로고 영역 */}
        <View style={styles.logoContainer}>
          <Image source={require('@/assets/images/logo.png')} style={styles.logoImage} />
        </View>

        <View style={styles.inputContainer}>
            {!isVerified ? (
                <>
                <CustomInput placeholder="이름" value={name} onChangeText={setName} editable={!isSent} />
                <CustomInput placeholder="아이디" value={id} onChangeText={setId} editable={!isSent} />
                <CustomInput placeholder="이메일 주소" value={email} onChangeText={setEmail} editable={!isSent} />
                {isSent && (
                    <CustomInput 
                    placeholder="인증번호 6자리" 
                    value={verificationCode} 
                    onChangeText={setVerificationCode} 
                    keyboardType="number-pad" 
                    maxLength={6} 
                    />
                )}
                </>
            ) : (
                <>
                {/* 새 비밀번호 입력창 */}
                <View style={{ width: '100%', position: 'relative', justifyContent: 'center' }}>
                    <CustomInput 
                    placeholder="새 비밀번호"
                    value={newPassword} 
                    onChangeText={setNewPassword} 
                    secureTextEntry={!isPasswordVisible1} 
                    />
                    
                    <TouchableOpacity 
                    onPress={() => setIsPasswordVisible1(!isPasswordVisible1)}
                    style={{ 
                        position: 'absolute', 
                        right: 15, 
                        zIndex: 1,
                        padding: 5 // ✨ 터치 영역을 조금 더 넓게 잡아주면 좋습니다.
                    }}
                    >
                    <Ionicons 
                        name={isPasswordVisible1 ? "eye-outline" : "eye-off-outline"} 
                        size={22}
                        color="#333" 
                    />
                    </TouchableOpacity>
                </View>

                {/* 비밀번호 확인창도 필요하다면 아래에 추가 */}
                <View style={{ width: '100%', position: 'relative', justifyContent: 'center' }}>
                    <CustomInput 
                        placeholder="새 비밀번호 확인" 
                        value={confirmPassword} 
                        onChangeText={setConfirmPassword} 
                        secureTextEntry={!isPasswordVisible2} 
                    />
                    <TouchableOpacity 
                        onPress={() => setIsPasswordVisible2(!isPasswordVisible2)}
                        style={{ position: 'absolute', right: 15, zIndex: 1, padding: 5 }}
                    >
                    <Ionicons 
                        name={isPasswordVisible2 ? "eye-outline" : "eye-off-outline"} 
                        size={22} color="#333" 
                    />
                    </TouchableOpacity>
                </View>
                </>
            )}
            </View>

        <View style={styles.submitButtonContainer}>
          <CustomButton 
            title={!isSent ? "본인인증 하기" : (!isVerified ? "인증 완료" : "비밀번호 변경")} 
            onPress={handleAction} 
          />
        </View>
      </View>
    </View>
  );
}