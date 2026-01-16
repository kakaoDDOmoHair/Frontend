import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

interface Props extends TextInputProps {
  // TextInput이 기본적으로 가지는 모든 속성(placeholder 등)을 그대로 상속받습니다.
  /* 추가 속성 필요 시 작성*/
}

export const CustomInput = (props: Props) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholderTextColor="#888"
        autoCapitalize="none" // 첫 글자 자동 대문자 방지
        {...props} // 부모가 전달한 value, onChangeText 등을 한 번에 적용합니다.
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 15,
    paddingHorizontal: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  input: {
    fontSize: 16,
    color: '#000',
  },
});