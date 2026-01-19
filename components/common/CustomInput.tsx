import { Ionicons } from "@expo/vector-icons";
import React, { forwardRef } from "react";
import { StyleSheet, TextInput, TextInputProps, View, ViewStyle } from "react-native";

// 아이콘 이름의 타입을 Ionicons에서 제공하는 실제 이름들로 제한합니다.
interface CustomInputProps extends TextInputProps {
  icon?: keyof typeof Ionicons.glyphMap; 
  style?: ViewStyle;
}

// forwardRef를 사용하여 부모(Registration)가 이 컴포넌트의 TextInput에 접근할 수 있게 합니다.
export const CustomInput = forwardRef<TextInput, CustomInputProps>(
  ({ icon, style, ...props }, ref) => {
    return (
      <View style={[styles.inputContainer, style]}>
        <TextInput
          ref={ref}
          style={styles.input}
          placeholderTextColor="#AFAFAF"
          // 웹 환경에서 자동완성 기능을 끄려면 아래 속성을 추가할 수 있습니다.
          autoCapitalize="none"
          {...props}
        />
        {/* icon 프롭이 전달되었을 때만 Ionicons를 렌더링합니다. */}
        {icon && (
          <Ionicons 
            name={icon} 
            size={20} 
            color="#6C5CE7" 
            style={styles.icon} 
          />
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  inputContainer: {
    backgroundColor: "#F7F7F7",
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 15,
    flexDirection: "row", // 텍스트 입력창과 아이콘을 가로로 배치
    alignItems: "center",
    marginBottom: 10,
  },
  input: {
    flex: 1, // 아이콘을 제외한 나머지 공간을 모두 차지
    fontSize: 15,
    color: "#000",
    paddingVertical: 0, // Android에서 텍스트가 잘리는 현상 방지
  },
  icon: {
    marginLeft: 10, // 입력창과 아이콘 사이의 간격
  },
});