import React from "react";
import { Text as RNText, StyleSheet, TextProps } from "react-native";

export default function CustomText({ style, ...props }: TextProps) {
  // 1. Flatten all Tailwind styles into one readable object
  const flatStyle = StyleSheet.flatten(style || {}) as any;
  const newStyle = { ...flatStyle };

  // 2. Default font (regular weight)
  let customFontFamily = "DanaFaNum-Regular";

  // 3. Find font-weight classes (such as font-bold or font-extrabold)
  if (flatStyle.fontWeight) {
    const weight = flatStyle.fontWeight.toString();

    if (weight === "bold" || weight === "700") {
      customFontFamily = "DanaFaNum-Bold";
    } else if (weight === "800" || weight === "900" || weight === "extrabold") {
      customFontFamily = "DanaFaNum-ExtraBold";
    } else if (weight === "500" || weight === "600" || weight === "medium") {
      // If you do not have the Medium font file, set this to Regular as well
      customFontFamily = "DanaFaNum-Bold";
    }

    delete newStyle.fontWeight;
  }

  return (
    <RNText
      {...props}
      style={[newStyle, { fontFamily: customFontFamily, textAlign: "right" }]}
    />
  );
}
