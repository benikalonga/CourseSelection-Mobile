import * as FileSystem from "expo-file-system/legacy";
import * as NavigationBar from "expo-navigation-bar";
import * as Sharing from "expo-sharing";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import ViewShot from "react-native-view-shot";

import ExportTimelineGrid from "../components/course/ExportTimelineGrid";
import MobileTimeline from "../components/course/MobileTimeline";
import CourseForm from "../components/form/CourseForm";
import Footer from "../components/layout/Footer";
import Topbar from "../components/layout/Topbar";
import UpdateModal from "../components/ui/UpdateModal";
import WelcomeModal from "../components/ui/WelcomeModal";
import { useCourseStore } from "../store/useCourseStore";
import { checkForUpdatesAsync } from "../utils/updateChecker";

const screenWidth = Dimensions.get("window").width;

export default function Home() {
  const { theme, courses } = useCourseStore();
  const insets = useSafeAreaInsets();
  const isDark = theme === "dark";

  const bgColor = isDark ? "#090a0f" : "#f5f7fa";
  const timelineRef = useRef<any>(null);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  const bannerAnim = useRef(new Animated.Value(150)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const [updateInfo, setUpdateInfo] = useState<{
    isOpen: boolean;
    latestVersion: string;
    currentVersion: string;
  }>({
    isOpen: false,
    latestVersion: "",
    currentVersion: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      checkForUpdatesAsync()
        .then((result) => {
          if (
            result.hasUpdate &&
            !result.isDismissedRecently &&
            result.latestVersion
          ) {
            setUpdateInfo({
              isOpen: true,
              latestVersion: result.latestVersion,
              currentVersion: result.currentVersion,
            });
          }
        })
        .catch(() => {});
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (Platform.OS === "android") {
      try {
        SystemUI.setBackgroundColorAsync(bgColor).catch(() => {});
        if ("setStyle" in NavigationBar) {
          NavigationBar.setStyle(isDark ? "light" : "dark");
        } else if ("setButtonStyleAsync" in NavigationBar) {
          (NavigationBar as any).setButtonStyleAsync(isDark ? "light" : "dark").catch(() => {});
        }
      } catch {}
    }
  }, [isDark, bgColor]);

  useEffect(() => {
    Animated.spring(bannerAnim, {
      toValue: 0,
      damping: 20,
      stiffness: 150,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isAtBottom ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isAtBottom]);

  // Close the notice with the X button
  const dismissBanner = () => {
    Animated.timing(bannerAnim, {
      toValue: 150,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsBannerDismissed(true));
  };

  // Track the user's scroll to detect reaching the end of the page
  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    // If within 120 pixels of the end, we have reached the main footer
    const isBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 120;

    if (isBottom !== isAtBottom) {
      setIsAtBottom(isBottom);
    }
  };

  const handleCaptureTimeline = async (): Promise<void> => {
    if (courses.length === 0) {
      Toast.show({ type: "error", text1: "The timeline is empty." });
      return Promise.reject(new Error("Empty timeline"));
    }

    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          if (timelineRef.current && timelineRef.current.capture) {
            const uri = await timelineRef.current.capture();

            if (Platform.OS === "android") {
              try {
                const FS = FileSystem as any;
                const permissions =
                  await FS.StorageAccessFramework.requestDirectoryPermissionsAsync();
                if (permissions.granted) {
                  const imgUri =
                    await FS.StorageAccessFramework.createFileAsync(
                      permissions.directoryUri,
                      `course_selection_timeline_${Date.now()}.png`,
                      "image/png",
                    );
                  const base64Data = await FS.readAsStringAsync(uri, {
                    encoding: FS.EncodingType.Base64,
                  });
                  await FS.writeAsStringAsync(imgUri, base64Data, {
                    encoding: FS.EncodingType.Base64,
                  });

                  Toast.show({
                    type: "success",
                    text1: "High-quality image saved to your phone.",
                  });
                  resolve();
                  return;
                } else {
                  reject(new Error("Canceled by user"));
                  return;
                }
              } catch (safError) {
                if (await Sharing.isAvailableAsync()) {
                  await Sharing.shareAsync(uri, {
                    mimeType: "image/png",
                    dialogTitle: "Save or share image",
                  });
                }
                resolve();
                return;
              }
            }

            if (await Sharing.isAvailableAsync()) {
              await Sharing.shareAsync(uri, {
                mimeType: "image/png",
                dialogTitle: "Share schedule image",
              });
            }
            resolve();
          } else {
            reject(new Error("Capture failed"));
          }
        } catch (error) {
          Toast.show({ type: "error", text1: "Failed to export the image." });
          reject(error);
        }
      }, 150);
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <WelcomeModal />
      <UpdateModal
        visible={updateInfo.isOpen}
        latestVersion={updateInfo.latestVersion}
        currentVersion={updateInfo.currentVersion}
        onClose={() => setUpdateInfo((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Floating footer layer (notice) */}
      {!isBannerDismissed && (
        <Animated.View
          style={{
            position: "absolute",
            bottom: insets.bottom + 16,
            left: 16,
            right: 16,
            zIndex: 100,
            transform: [{ translateY: bannerAnim }],
            opacity: fadeAnim,
          }}
          pointerEvents={isAtBottom ? "none" : "auto"} // Disable taps while faded out
        >
          <Footer isFloating onClose={dismissBanner} />
        </Animated.View>
      )}

      {/* Hidden layer used to render the high-quality image export */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: screenWidth + 1000,
          width: 3000,
          height: 3000,
          alignItems: "flex-start",
        }}
        pointerEvents="none"
      >
        <ViewShot
          ref={timelineRef}
          options={{ format: "png", quality: 1 }}
          style={{ backgroundColor: bgColor }}
        >
          <ExportTimelineGrid />
        </ViewShot>
      </View>

      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: insets.top + 35,
          backgroundColor: bgColor,
          zIndex: 40,
        }}
      />

      <View
        className="absolute left-0 right-0 z-50 px-4"
        style={{ top: insets.top + 12 }}
        pointerEvents="box-none"
      >
        <Topbar onExportImage={handleCaptureTimeline} />
      </View>

      <ScrollView
        className="flex-1"
        style={{ backgroundColor: bgColor }}
        contentContainerStyle={{
          paddingTop: insets.top + 90,
          paddingHorizontal: 16,
          paddingBottom: 32 + insets.bottom,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <CourseForm />
        <MobileTimeline />

        <View className="flex-1 min-h-[40px]" />

        {/* Main footer pinned to the bottom of the page */}
        <Footer />
      </ScrollView>
    </View>
  );
}
