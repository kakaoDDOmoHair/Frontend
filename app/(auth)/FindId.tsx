import { CustomButton } from '@/components/common/CustomButton';
import { CustomInput } from '@/components/common/CustomInput';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Keyboard, Modal, Platform, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../../styles/auth/FindId';

export default function FindIdScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [foundId, setFoundId] = useState('');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const mockUserDB = [
    { name: "고지운", Id: "jun" },
    { name: "김도홍", Id: "hong" },
    { name: "김현아", Id: "annie" },
    { name: "정준영", Id: "crong"}
  ];

  const showAlert = (message: string) => {
    if (Platform.OS === 'web') {
      alert(message);
    } else {
      Alert.alert('알림', message);
    }
  };

  const handleAction = () => {
    if (!isSent) {
      if (name.trim() === "" || email.trim() === "") {
        showAlert("이름과 이메일을 입력해주세요.");
        return;
      }
      setIsSent(true);
      showAlert("인증번호가 발송되었습니다.");
    } else {
      if (verificationCode.length !== 6) {
        showAlert("인증번호 6자리를 입력해주세요.");
        return;
      }

      const user = mockUserDB.find(u => u.name === name.trim());
      
      if (user) {
        setFoundId(user.Id);
        setIsVerified(true);
      } else {
        showAlert("입력하신 정보와 일치하는 아이디가 없습니다.");
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. 결과 팝업 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isVerified}
        onRequestClose={() => setIsVerified(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>

            <Text style={styles.resultText}>
              <Text style={{fontWeight: 'bold'}}>{name}</Text>님의 ID는 
              <Text style={{fontWeight: 'bold', color: '#6C5CE7'}}>{foundId}</Text> 입니다.
            </Text>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.smallButton} onPress={() => {
                setIsVerified(false);
                router.replace('/(auth)/Login');
              }}>
                <Text style={styles.smallButtonText}>로그인</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.smallButton} onPress={() => showAlert("비밀번호 찾기 페이지 준비 중")}>
                <Text style={styles.smallButtonText}>비밀번호 찾기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 2. 메인 입력 화면 */}
      <View style={styles.innerContainer}>
        {/* ✨ 메인 화면 로고 복구 */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('@/assets/images/logo.png')} 
            style={styles.logoImage} 
          />
        </View>

        <View style={styles.inputContainer}>
          <CustomInput placeholder="이름" value={name} onChangeText={setName} editable={!isSent} />
          <CustomInput placeholder="이메일주소" value={email} onChangeText={setEmail} editable={!isSent} />
          {isSent && (
            <CustomInput 
              placeholder="인증번호 6자리" 
              value={verificationCode} 
              onChangeText={setVerificationCode} 
              keyboardType="number-pad" 
              maxLength={6} 
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
          )}
        </View>

        <View style={styles.submitButtonContainer}>
          <CustomButton title={isSent ? "인증하기" : "메일 발송"} onPress={handleAction} />
        </View>
        <View style={{ height: 30, marginTop: 10 }} />
      </View>
    </View>
  );
}