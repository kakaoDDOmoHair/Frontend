import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// 인터페이스가 정의된 경로를 확인해주세요.
import { ContractData, CONTRACT_DATA as INITIAL_DATA } from '../../../components/contract/Data';
import { styles } from '../../../styles/tabs/boss/Contract';

/**
 * 1. 개별 계약서 카드 컴포넌트
 */
const BossContract: React.FC<{ 
  data: ContractData; 
  onDelete: (id: string) => void 
}> = ({ data, onDelete }) => {
  
  const handleView = () => {
    Alert.alert(
      '계약서 열람', 
      `${data.name}님의 근로계약서를 불러오시겠습니까?`, 
      [{ text: '취소', style: 'cancel' }, { text: '확인', onPress: () => Alert.alert('알림', '근로계약서를 성공적으로 불러왔습니다.') }]
    );
  };

  const handleDownload = () => {
    Alert.alert('다운로드', `${data.name}_계약서.pdf를 저장하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      { text: '확인', onPress: () => Alert.alert('알림', '다운로드가 완료되었습니다.') }
    ]);
  };

  const handleDelete = () => {
    Alert.alert('계약 삭제', `${data.name}님의 데이터를 삭제하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      { 
        text: '삭제', 
        style: 'destructive', 
        onPress: () => {
          onDelete(data.id);
          Alert.alert('알림', '삭제되었습니다.');
        } 
      }
    ]);
  };

  const buttons = [
    { label: '계약서 열람', action: handleView },
    { label: '다운', action: handleDownload },
    { label: '삭제', action: handleDelete },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{data.name} ({data.location})</Text>
      <View style={styles.statusRow}>
        {/* 상태에 따른 도트 색상 변경: '계약 중'은 초록, '해지'나 '만료'는 회색 */}
        <View style={[styles.statusDot, { backgroundColor: data.status === '계약 중' ? '#34C759' : '#D3D3D3' }]} />
        <Text style={styles.statusText}>{data.status} | {data.wage.toLocaleString()}원</Text>
      </View>
      <View style={styles.buttonRow}>
        {buttons.map((btn) => (
          <TouchableOpacity key={btn.label} style={styles.actionButton} onPress={btn.action}>
            <Text style={styles.actionButtonText}>{btn.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

/**
 * 2. 메인 ContractScreen 컴포넌트
 */
export default function ContractScreen() {
  const router = useRouter();
  const [notificationCount] = useState(3);
  const [isScanning, setIsScanning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [contracts, setContracts] = useState<ContractData[]>(INITIAL_DATA);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);

  const deleteContract = (id: string) => {
    setContracts(prev => prev.filter(item => item.id !== id));
  };

  /**
   * AI 계약서 분석 시뮬레이션
   * 변경된 status 타입('계약 중')에 맞춰 데이터를 생성합니다.
   */
  const analyzeContractAI = async (imageUri: string): Promise<ContractData> => {
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      id: String(Date.now()), 
      name: "홍길동(AI추출)", 
      location: "제주공항점", 
      status: '계약 중', // 변경된 리터럴 타입 적용
      wage: 11000, 
      isResigned: false,
      resignedDate: undefined // 근무 중인 경우 undefined 처리
    };
  };

  // 퇴사자 3개월 보관 기간 체크 로직 (2026년 기준)
  const isWithinThreeMonths = (dateString?: string) => {
    if (!dateString) return true;
    const resignedDate = new Date(dateString);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return resignedDate > threeMonthsAgo;
  };

  const activeContracts = contracts.filter(c => !c.isResigned);
  const resignedContracts = contracts.filter(c => 
    c.isResigned && isWithinThreeMonths(c.resignedDate)
  );

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setRotation(0);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return Alert.alert('권한 필요', '카메라 접근 권한이 필요합니다.');
    
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setRotation(0);
    }
  };

  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleUpload = async () => {
    if (!selectedImage) return Alert.alert('알림', '계약서를 먼저 선택해주세요.');

    try {
      setIsAnalyzing(true);
      const newContract = await analyzeContractAI(selectedImage);
      setContracts(prev => [newContract, ...prev]);
      Alert.alert('성공', 'AI 분석을 통해 신규 계약서가 등록되었습니다.');
      setIsScanning(false);
      setSelectedImage(null);
    } catch (error) {
      Alert.alert('오류', '계약서 분석 중 문제가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* 헤더 */}
      <View style={styles.header}>
        <Image source={require('../../../assets/images/logo.png')} style={{ width: 90, height: 70 }} resizeMode="contain" />
        <TouchableOpacity onPress={() => router.push('./(tabs)/boss/Notification')} style={{ position: 'relative' }}>
          <Ionicons name="notifications" size={24} color="#D1C4E9" />
          {notificationCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{notificationCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>신규 계약 준비</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={() => setIsScanning(true)}>
            <Text style={styles.uploadButtonText}>계약서 스캔 및 업로드</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>관리 리스트</Text>
          {activeContracts.map(item => (
            <BossContract key={item.id} data={item} onDelete={deleteContract} />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>퇴사자 관리 (3개월 보관)</Text>
          {resignedContracts.length > 0 ? (
            resignedContracts.map(item => (
              <BossContract key={item.id} data={item} onDelete={deleteContract} />
            ))
          ) : (
            <Text style={{ color: '#AFAFAF', paddingHorizontal: 20, marginTop: 10 }}>
              보관 기간(3개월)이 지난 데이터가 없습니다.
            </Text>
          )}
        </View>
      </ScrollView>
      
      {/* 스캔 및 분석 모달 */}
      <Modal visible={isScanning} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.scannerContainer}>
            <Text style={styles.scannerTitle}>계약서 스캔</Text>
            <View style={styles.guideContainer}>
              <Text style={styles.guideMainTitle}>문서 가이드 라인</Text>
              {isAnalyzing ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#9747FF" />
                  <Text style={{ marginTop: 15, color: '#9747FF', fontWeight: 'bold' }}>AI가 계약서를 분석 중입니다...</Text>
                </View>
              ) : (
                <View style={[styles.dashedBox, selectedImage ? { borderWidth: 0 } : null]}>
                  {selectedImage ? (
                    <Image 
                      source={{ uri: selectedImage }} 
                      style={{ 
                        width: '100%', height: '100%', borderRadius: 25,
                        transform: [{ rotate: `${rotation}deg` }] 
                      }} 
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.guideText}>종이 계약서를 영역 안에 맞춰주세요</Text>
                  )}
                </View>
              )}
              <View style={styles.scanControlRow}>
                <TouchableOpacity style={styles.scanControlBtn} onPress={pickImage} disabled={isAnalyzing}>
                  <Text style={styles.controlIcon}>🖼️ 갤러리</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.scanControlBtn} onPress={takePhoto} disabled={isAnalyzing}>
                  <Text style={styles.controlIcon}>📷 촬영</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.scanControlBtn} onPress={handleRotate} disabled={isAnalyzing}>
                  <Text style={styles.controlIcon}>🔄 회전</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => { setIsScanning(false); setSelectedImage(null); }} disabled={isAnalyzing}>
                <Text style={styles.modalCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleUpload} disabled={isAnalyzing || !selectedImage}>
                <Text style={styles.modalSubmitText}>{isAnalyzing ? '분석 중...' : '등록하기'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}