import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import {
  CalendarDays,
  Download,
  MessageSquareHeart,
  Palette,
  PenLine,
  Plus,
  Sparkles,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useCourseStore } from "../../store/useCourseStore";
import Text from "./CustomText";
import { TelegramIcon } from "./SocialIcons";

const { height } = Dimensions.get("window");
const STORAGE_KEY = "hasSeenWelcome";

interface Section {
  key: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  body: string;
}

export default function WelcomeModal() {
  const isDark = useCourseStore((state) => state.theme) === "dark";

  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((hasSeen) => {
      if (!hasSeen) {
        setIsOpen(true);
        setIsVisible(true);
      }
    });
  }, []);

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 22,
          stiffness: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const handleClose = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, "true");
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 40,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsOpen(false);
      setIsVisible(false);
    });
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    if (contentOffset.y + layoutMeasurement.height >= contentSize.height - 50) {
      setIsAtBottom(true);
    }
  };

  const sections: Section[] = [
    {
      key: "add",
      icon: <Plus size={22} color="#3b82f6" />,
      iconBg: "bg-blue-500/10 border-blue-500/20",
      title: "Add courses: smart and conflict-free ➕",
      body: "Tap \"Add\" in the top bar. The app is smart enough that if your class overlaps another one by even a minute, it catches it and warns you! 🕵️‍♂️✨",
    },
    {
      key: "timeline",
      icon: <CalendarDays size={22} color="#10b981" />,
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      title: "Daily timeline, built for mobile 📅",
      body: "Your weekly schedule is shown as a vertical timeline sorted by day; just pick the day you want from the tabs at the top.",
    },
    {
      key: "edit",
      icon: <PenLine size={22} color="#f59e0b" />,
      iconBg: "bg-amber-500/10 border-amber-500/20",
      title: "Easy management: edit and delete ✏️",
      body: "Tap any course to open its full details in a glass panel. Edit or delete it easily; we always ask for confirmation before deleting so your work is not lost. 🛡️",
    },
    {
      key: "export",
      icon: <Download size={22} color="#6366f1" />,
      iconBg: "bg-indigo-500/10 border-indigo-500/20",
      title: "Export and backup 📸",
      body: "Tap download in the top menu. You can export your schedule as an image (PNG) or a PDF, or make a backup file (JSON) of all your data to restore whenever you like. 🚀",
    },
    {
      key: "theme",
      icon: <Palette size={22} color="#ef4444" />,
      iconBg: "bg-red-500/10 border-red-500/20",
      title: "Theme magic 🎨",
      body: "Eyes tired? Change the app colors with the theme button; there is a dark theme and a light theme, pick the one you like. 🌗",
    },
  ];

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-center items-center px-4">
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: fadeAnim,
          }}
        >
          <TouchableWithoutFeedback>
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)" }} />
          </TouchableWithoutFeedback>
        </Animated.View>

        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
            maxHeight: height * 0.85,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: isDark ? 0.6 : 0.2,
            shadowRadius: 24,
            elevation: 35,
          }}
          className={`w-full rounded-[32px] overflow-hidden border ${
            isDark
              ? "bg-[#12141c] border-[#1f222a]"
              : "bg-white border-gray-200"
          }`}
        >
          <View
            className={`items-center pt-8 pb-5 border-b ${
              isDark ? "border-[#1f222a]" : "border-gray-100"
            }`}
          >
            <Text className="text-5xl pt-3">👋</Text>
            <Text
              className={`text-[17px] font-extrabold text-center px-4 leading-8 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Welcome to the course selection guide! 🎉
            </Text>
          </View>

          <ScrollView
            onScroll={handleScroll}
            scrollEventThrottle={16}
            className="px-5"
            contentContainerStyle={{ paddingVertical: 24, gap: 24 }}
            showsVerticalScrollIndicator={false}
          >
            <Text
              className={`text-[14px] font-bold text-center leading-7 mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Hi! Everything here is designed to make it easy to build a perfect weekly
              schedule without the headache. Here is a quick tour of how the app works:
            </Text>

            {sections.map((s) => (
              <View key={s.key} className="flex-row-reverse gap-4">
                <View
                  className={`w-12 h-12 rounded-full items-center justify-center border shrink-0 ${s.iconBg}`}
                >
                  {s.icon}
                </View>
                <View className="flex-1 justify-center">
                  <Text
                    className={`text-[15px] font-extrabold mb-1.5 text-right ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {s.title}
                  </Text>
                  <Text
                    className={`text-[13px] leading-6 text-right ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {s.body}
                  </Text>
                </View>
              </View>
            ))}

            <View
              className={`p-5 mt-2 rounded-2xl border items-center ${
                isDark
                  ? "bg-[#1a1c23] border-[#272a35]"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <MessageSquareHeart
                size={24}
                color={isDark ? "#9ca3af" : "#6b7280"}
              />
              <Text
                className={`text-[14px] font-extrabold text-center mt-3 mb-1 ${
                  isDark ? "text-gray-200" : "text-gray-800"
                }`}
              >
                Have a suggestion? Found a bug? 🐞
              </Text>
              <Text
                className={`text-[12px] text-center leading-6 mb-4 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Message me directly on Telegram:
              </Text>
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL("https://t.me/nematidev").catch(() => {})
                }
                activeOpacity={0.8}
                className={`flex-row-reverse items-center justify-center gap-2 px-5 py-3 rounded-xl border w-full ${
                  isDark
                    ? "bg-[#12141c] border-[#272a35]"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text className="text-[13px] font-bold text-[#229ED9]">
                  @nematidev
                </Text>
                <TelegramIcon size={18} color="#229ED9" />
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View
            className={`p-5 border-t ${
              isDark
                ? "border-[#1f222a] bg-[#0f1117]"
                : "border-gray-100 bg-gray-50"
            }`}
          >
            <TouchableOpacity
              onPress={handleClose}
              activeOpacity={0.85}
              className={`w-full flex-row items-center justify-center py-4 rounded-2xl transition-colors duration-300 ${
                isAtBottom
                  ? "bg-blue-500"
                  : isDark
                    ? "bg-[#1f222a]"
                    : "bg-gray-200"
              }`}
            >
              {isAtBottom ? (
                <>
                  <Sparkles size={18} color="#fff" />
                  <Text className="text-white font-extrabold text-[15px] text-center mr-2">
                    Got it, thanks!
                  </Text>
                </>
              ) : (
                <Text
                  className={`font-extrabold text-[15px] text-center ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Skip, I already know how 🙄
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
