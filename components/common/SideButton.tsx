import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface SideButtonProps {
  title: string;
  onPress?: () => void;
}

export const SideButton = ({ title, onPress }: SideButtonProps) => (
  <TouchableOpacity style={localStyles.sideButton} onPress={onPress}>
    <Text style={localStyles.sideButtonText}>{title}</Text>
  </TouchableOpacity>
);

const localStyles = StyleSheet.create({
  sideButton: {
    backgroundColor: "#EBE6FF",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  sideButtonText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "600",
  },
});
