export interface ContractData {
  id: string;
  name: string;
  location: string;
  status: '계약 중' | '만료' | '해지';
  wage: number;
  isResigned: boolean;
  resignedDate?: string; //계약 해지일 (isResigned가 true일 때만 존재), 'YYYY-MM-DD' 형식의 퇴사 날짜 추가
}

export const CONTRACT_DATA: ContractData[] = [
  { id: '1', name: '김철수', location: '제주공항점', status: '계약 중', wage: 11000, isResigned: false },
  { id: '2', name: '이영희', location: '서귀포점', status: '계약 중', wage: 11000, isResigned: false },
  { id: '3', name: '박지성', location: '제주공항점', status: '해지', wage: 11000, isResigned: true },
];