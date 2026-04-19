/**
 * Sign-Up Screen (OTP-Based)
 * 
 * Purpose:
 * - Handle user registration via Email OTP
 * - Three-step flow: Name+Email -> OTP verification -> Account created
 * 
 * Key Features:
 * - Email and name validation
 * - OTP request and verification
 * - Form validation
 * - Accessible form inputs
 */

import "@/global.css";
import { clsx } from "clsx";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, useRouter } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView as RNKeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { styled } from "nativewind";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "react-native-toast-notifications";

const SafeAreaView = styled(RNSafeAreaView);
const KeyboardAwareScrollView = styled(RNKeyboardAwareScrollView);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const otpRegex = /^\d{6}$/;

interface SignUpFieldErrors {
  name?: string;
  email?: string;
  otp?: string;
}

const SignUpScreen = () => {
  const { sendOTP, verifyOTP } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const otpNavigateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<SignUpFieldErrors>({});
  const [step, setStep] = useState<"signup" | "otp">("signup");
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  useEffect(() => {
    return () => {
      if (otpNavigateTimeoutRef.current) {
        clearTimeout(otpNavigateTimeoutRef.current);
        otpNavigateTimeoutRef.current = null;
      }
    };
  }, []);

  const handleCreateAccount = async () => {
    try {
      if (!name.trim()) {
        setErrors((prev) => ({ ...prev, name: "Name is required" }));
        return;
      }
      if (!email.trim()) {
        setErrors((prev) => ({ ...prev, email: "Email is required" }));
        return;
      }
      if (!emailRegex.test(email.trim())) {
        setErrors((prev) => ({ ...prev, email: "Enter a valid email" }));
        return;
      }

      setIsLoading(true);

      await sendOTP(email, name);

      toast.show("Code sent to your email", { type: "success" });
      setStep("otp");
      setOtp("");
      setResendTimer(60);
      setErrors({});
    } catch (error: any) {
      const errorMessage =
        error?.message || error?.response?.data?.message || "Failed to send OTP";
      console.error("[SignUp] Error:", errorMessage);
      setErrors((prev) => ({ ...prev, email: errorMessage }));
      toast.show(errorMessage, { type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      if (!otp.trim() || !otpRegex.test(otp)) {
        setErrors((prev) => ({ ...prev, otp: "OTP must be 6 digits" }));
        return;
      }

      setIsLoading(true);
      await verifyOTP(email, otp);

      toast.show("Account created successfully!", { type: "success" });
      otpNavigateTimeoutRef.current = setTimeout(() => {
        router.replace("/(tabs)");
        otpNavigateTimeoutRef.current = null;
      }, 500);
    } catch (error: any) {
      const errorMessage =
        error?.message || error?.response?.data?.message || "Failed to verify OTP";
      console.error("[SignUp] Error:", errorMessage);
      setErrors((prev) => ({ ...prev, otp: errorMessage }));
      toast.show(errorMessage, { type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const canCreateAccount = name.trim() && email.trim() && emailRegex.test(email.trim()) && !isLoading;
  const canVerifyOTP = otp.trim() && otpRegex.test(otp) && !isLoading;

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAwareScrollView
        className="auth-scroll px-5"
        contentContainerClassName="auth-content"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        extraScrollHeight={24}
      >
        <View className="auth-brand-block">
          <View className="auth-logo-wrap">
            <View className="auth-logo-mark">
              <Text className="auth-logo-mark-text">R</Text>
            </View>
            <View>
              <Text className="auth-wordmark">Recurrly</Text>
              <Text className="auth-wordmark-sub">Smart billing</Text>
            </View>
          </View>
          <Text className="auth-title">
            {step === "signup" ? "Create account" : "Verify email"}
          </Text>
          <Text className="auth-subtitle">
            {step === "signup"
              ? "Start managing subscriptions today"
              : `Code sent to ${email}`}
          </Text>
        </View>

        <View className="auth-card">
          {step === "signup" ? (
            <View className="auth-form">
              <View className="auth-field">
                <Text className="auth-label">Full name</Text>
                <TextInput
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder="Your name"
                  placeholderTextColor="rgba(0, 0, 0, 0.45)"
                  editable={!isLoading}
                  className="auth-input"
                />
                {errors.name && <Text className="auth-error-text">{errors.name}</Text>}
              </View>

              <View className="auth-field">
                <Text className="auth-label">Email address</Text>
                <TextInput
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="your@email.com"
                  placeholderTextColor="rgba(0, 0, 0, 0.45)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                  className="auth-input"
                />
                {errors.email && <Text className="auth-error-text">{errors.email}</Text>}
              </View>

              <Pressable
                onPress={handleCreateAccount}
                disabled={!canCreateAccount}
                className={clsx("auth-button", !canCreateAccount && "auth-button-disabled")}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="auth-button-text">Send code</Text>
                )}
              </Pressable>
            </View>
          ) : (
            <View className="auth-form">
              <View className="auth-field">
                <Text className="auth-label">Enter 6-digit code</Text>
                <TextInput
                  value={otp}
                  onChangeText={(text) => {
                    setOtp(text.replace(/[^0-9]/g, "").slice(0, 6));
                    if (errors.otp) setErrors((prev) => ({ ...prev, otp: undefined }));
                  }}
                  placeholder="000000"
                  placeholderTextColor="rgba(0, 0, 0, 0.45)"
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!isLoading}
                  className="auth-input text-center text-xl tracking-widest"
                />
                {errors.otp && <Text className="auth-error-text">{errors.otp}</Text>}
              </View>

              <Pressable
                onPress={handleVerifyOTP}
                disabled={!canVerifyOTP}
                className={clsx("auth-button", !canVerifyOTP && "auth-button-disabled")}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="auth-button-text">Create account</Text>
                )}
              </Pressable>

              <Pressable
                onPress={() => setStep("signup")}
                disabled={isLoading}
                className="mt-4"
              >
                <Text className="text-center text-gray-600">
                  <Ionicons name="chevron-back" size={14} /> Back
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        <View className="auth-footer">
          <Text className="auth-footer-text">
            Already have an account?{" "}
            <Link href="/(auth)/sign-in" className="text-blue-600 font-semibold">
              Sign in
            </Link>
          </Text>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default SignUpScreen;
