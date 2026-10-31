import { AlertTriangle } from "lucide-react-native";
import React from "react";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useCourseStore } from "../../store/useCourseStore";
import Text from "./CustomText";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  courseName: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  courseName,
}: Props) {
  const isDark = useCourseStore((state) => state.theme) === "dark";

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center px-6">
        {/* Dark backdrop covering the whole screen */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "rgba(0,0,0,0.7)" },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Main modal box with a deep shadow */}
        <View
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: isDark ? 0.6 : 0.2,
            shadowRadius: 20,
            elevation: 35,
          }}
          className={`w-full p-6 rounded-[32px] ${isDark ? "bg-[#12141c] border border-[#1f222a]" : "bg-white"}`}
        >
          <View className="items-center justify-center mb-4 mt-2">
            <View
              className={`p-4 rounded-full ${isDark ? "bg-red-500/10" : "bg-red-50"}`}
            >
              <AlertTriangle size={32} color="#ef4444" />
            </View>
          </View>

          <Text
            className={`text-xl font-extrabold text-center mb-3 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Delete course
          </Text>

          <Text
            className={`text-sm text-center mb-8 leading-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Are you sure you want to delete{" "}
            <Text className="font-extrabold text-red-500">"{courseName}"</Text>
            ?
          </Text>

          <View className="flex-row-reverse gap-3">
            {/* Cancel button (rendered first because of flex-row-reverse, so it sits on the right) */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              className={`flex-1 py-3.5 rounded-xl items-center justify-center border ${isDark ? "bg-[#1a1c23] border-[#272a35]" : "bg-white border-gray-200"}`}
            >
              <Text
                className={`font-bold text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            {/* Delete button (placed on the left) */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onConfirm}
              className="flex-1 py-3.5 rounded-xl bg-red-500 items-center justify-center shadow-sm"
            >
              <Text className="text-white font-extrabold text-sm">
                Yes, delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
