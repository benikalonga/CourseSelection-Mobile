import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { I18nManager, Linking, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import AnimatedSplash from "../components/ui/AnimatedSplash";
import { toastConfig } from "../components/ui/ToastConfig";
import { useCourseStore } from "../store/useCourseStore";
import { syncAllNotifications } from "../utils/notifications";

// Disable native RTL to avoid an Android touch bug
try {
  I18nManager.allowRTL(false);
  I18nManager.forceRTL(false);
} catch {}

// Safely prevent the splash screen from hiding too early
SplashScreen.preventAutoHideAsync().catch(() => {});

export function ErrorBoundary({
  error,
  retry,
}: {
  error: Error;
  retry: () => void;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#090a0f",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
      }}
    >
      <Text
        style={{
          color: "#ffffff",
          fontSize: 18,
          fontWeight: "bold",
          marginBottom: 10,
          textAlign: "center",
        }}
      >
        Something went wrong while running the app
      </Text>
      <Text
        style={{
          color: "#f87171",
          fontSize: 13,
          textAlign: "center",
          marginBottom: 24,
          lineHeight: 20,
        }}
      >
        {error?.message || "Unknown error"}
      </Text>
      <TouchableOpacity
        onPress={retry}
        style={{
          backgroundColor: "#2563eb",
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: "#ffffff", fontWeight: "bold" }}>Try again</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    DanaFaNum: require("../assets/fonts/DanaFaNum-Regular.ttf"),
    "DanaFaNum-Regular": require("../assets/fonts/DanaFaNum-Regular.ttf"),
    "DanaFaNum-Bold": require("../assets/fonts/DanaFaNum-Bold.ttf"),
    "DanaFaNum-ExtraBold": require("../assets/fonts/DanaFaNum-ExtraBold.ttf"),
    JetBrainsMono: require("../assets/fonts/JetBrainsMono.ttf"),
  });

  const [fontTimeout, setFontTimeout] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  // Safety timer for fonts so the screen does not stay black if fonts are slow or fail to load
  useEffect(() => {
    const timer = setTimeout(() => {
      setFontTimeout(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const isReady = Boolean(loaded || error || fontTimeout);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isReady]);

  const courses = useCourseStore((state) => state.courses);
  const theme = useCourseStore((state) => state.theme);
  const isDark = theme === "dark";

  useEffect(() => {
    if (isReady) {
      syncAllNotifications(courses);
    }
  }, [isReady, courses]);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const url = response.notification.request.content.data?.url;
      if (typeof url === "string") {
        Linking.openURL(url).catch(() => {});
      }
    });
    return () => sub.remove();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: isDark ? "#090a0f" : "#f5f7fa" },
        }}
      >
        <Stack.Screen name="index" />
      </Stack>
      <Toast config={toastConfig} topOffset={60} />
      {showCustomSplash && (
        <AnimatedSplash onFinish={() => setShowCustomSplash(false)} />
      )}
    </>
  );
}
