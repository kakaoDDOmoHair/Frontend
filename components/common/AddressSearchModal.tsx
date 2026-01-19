import React from "react";
import { Modal, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";

export const AddressSearchModal = ({ visible, onClose, onSelect }: any) => {
  // 웹 환경에서는 모달을 렌더링하지 않음 (Registration.tsx에서 별도 처리함)
  if (Platform.OS === "web") return null;

  const kakaoAddressHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <script src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
        <style>
          html, body { width:100%; height:100%; margin:0; padding:0; background-color: white; }
          #layer { width:100%; height:100%; }
        </style>
      </head>
      <body>
        <div id="layer"></div>
        <script type="text/javascript">
          new daum.Postcode({
            oncomplete: function(data) {
              window.ReactNativeWebView.postMessage(data.address);
            },
            width : '100%',
            height : '100%'
          }).embed(document.getElementById('layer'));
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    const addr = event.nativeEvent.data;
    if (addr && typeof addr === "string" && !addr.includes("webpack")) {
      onSelect(addr);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.title}>주소 검색</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={modalStyles.closeBtn}>닫기</Text>
          </TouchableOpacity>
        </View>
        <WebView
          source={{ html: kakaoAddressHtml }}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </SafeAreaView>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  header: {
    height: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: { fontSize: 16, fontWeight: "bold" },
  closeBtn: { color: "#6C5CE7", fontWeight: "bold", padding: 10 },
});