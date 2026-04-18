/**
 * Sign-In Screen (OTP-Based)
 * 
 * Purpose:
 * - Handle user login via Email OTP
 * - Two-step flow: Email input -> OTP verification
 * - Show toasts/banners for user feedback
 * 
 * Key Features:
 * - Email validation
 * - OTP request and verification
 * - Resend OTP functionality
 * - Accessible form inputs
 * - Error handling and user feedback
 * 
 * Dependencies:
 * - useAuth from AuthContext
 * - expo-router for navigation
 * - react-native-toast-notifications for feedback
 */

import "@/global.css";
import { clsx } from "clsx";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
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

interface SignInFieldErrors {
  email?: string;
  otp?: string;
}

/**
 * Sign-In Screen Component
 */
const SignInScreen = () => {
  const { sendOTP, verifyOTP, resendOTP } = useAuth();
  const router = useRouter();
  const toast = useToast();

  // Form state
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<SignInFieldErrors>({});
  const [step, setStep] = useState<"email" | "otp">("email"); // email or otp
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    console.log("[SignIn] Component mounted");
    return () => {
      console.log("[SignIn] Component unmounted");
    };
  }, []);

  /**
   * Handle resend timer countdown
   */
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

  /**
   * Validate email format
   */
  const validateEmail = (emailStr: string): boolean => {
    if (!emailStr.trim()) {
      setErrors({ ...errors, email: "Email is required" });
      return false;
    }
    if (!emailRegex.test(emailStr.trim())) {
      setErrors({ ...errors, email: "Enter a valid email address" });
      return false;
    }
    setErrors({ ...errors, email: undefined });
    return true;
  };

  /**
   * Validate OTP format
   */
  const validateOTP = (otpStr: string): boolean => {
    if (!otpStr.trim()) {
      setErrors({ ...errors, otp: "OTP is required" });
      return false;
    }
    if (!otpRegex.test(otpStr.trim())) {
      setErrors({ ...errors, otp: "OTP must be 6 digits" });
      return false;
    }
    setErrors({ ...errors, otp: undefined });
    return true;
  };

  /**
   * Handle email submission - send OTP
   */
  const handleSendOTP = async () => {
    try {
      if (isLoading) {
        return;
      }

      if (!validateEmail(email)) {
        return;
      }

      setIsLoading(true);
      console.log("[SignIn] Sending OTP to:", email);

      await sendOTP(email);

      toast.show("Code sent to your email", {
        type: "success",
        placement: "top",
        duration: 3000,
      });

      console.log("[SignIn] OTP sent successfully, moving to OTP screen");
      setStep("otp");
      setOtp("");
      setResendTimer(60); // 60 second cooldown before resend
    } catch (error: any) {
      const errorMessage =
        error.message || error.response?.data?.message || "Failed to send OTP";
      console.error("[SignIn] Error sending OTP:", errorMessage);
      setErrors({ ...errors, email: errorMessage });
      toast.show(errorMessage, {
        type: "error",
        placement: "top",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle OTP verification - sign in user
   */
  const handleVerifyOTP = async () => {
    try {
      if (isLoading) {
        return;
      }

      if (!validateOTP(otp)) {
        return;
      }

      setIsLoading(true);
      console.log("[SignIn] Verifying OTP for:", email);

      await verifyOTP(email, otp);

      toast.show("Welcome back!", {
        type: "success",
        placement: "top",
        duration: 2000,
      });

      console.log("[SignIn] OTP verified, redirecting to main app");
      setTimeout(() => {
        router.replace("/(tabs)");
      }, 500);
    } catch (error: any) {
      const errorMessage =
        error.message || error.response?.data?.message || "Failed to verify OTP";
      const remainingAttempts = error.response?.data?.remainingAttempts;

      console.error("[SignIn] Error verifying OTP:", errorMessage);

      setErrors({
        ...errors,
        otp:
          remainingAttempts !== undefined
            ? `${errorMessage} (${remainingAttempts} attempts left)`
            : errorMessage,
      });

      toast.show(
        `Invalid OTP${remainingAttempts ? ` (${remainingAttempts} attempts left)` : ""}`,
        {
          type: "danger",
          placement: "top",
          duration: 3000,
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle resend OTP
   */
  const handleResendOTP = async () => {
    try {
      if (isLoading || resendTimer > 0) {
        return;
      }

      console.log("[SignIn] Resending OTP to:", email);
      setIsLoading(true);

      await resendOTP(email);

      toast.show("Code resent to your email", {
        type: "success",
        placement: "top",
        duration: 3000,
      });

      setOtp("");
      setResendTimer(60);
      setErrors({ ...errors, otp: undefined });
    } catch (error: any) {
      const errorMessage =
        error.message || error.response?.data?.message || "Failed to resend OTP";
      console.error("[SignIn] Error resending OTP:", errorMessage);
      toast.show(errorMessage, {
        type: "error",
        placement: "top",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Go back to email step
   */
  const handleBackToEmail = () => {
    console.log("[SignIn] Going back to email step");
    setStep("email");
    setOtp("");
    setErrors({ ...errors, otp: undefined });
  };

  const emailError = errors.email;
  const otpError = errors.otp;
  const canSendOTP = email.trim() && emailRegex.test(email.trim()) && !isLoading;
  const canVerifyOTP = otp.trim() && otpRegex.test(otp.trim()) && !isLoading;

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAwareScrollView
        className="auth-scroll px-5"
        contentContainerClassName="auth-content"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        extraScrollHeight={24}
        keyboardOpeningTime={0}
        enableAutomaticScroll
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
            {step === "email" ? "Welcome back" : "Verify your email"}
          </Text>
          <Text className="auth-subtitle">
            {step === "email"
              ? "Sign in to continue managing your subscriptions"
              : `We sent a code to ${email}`}
          </Text>
        </View>

        <View className="auth-card">
          {step === "email" ? (
            // EMAIL STEP
            <View className="auth-form">
              <View className="auth-field">
                <Text className="auth-label">Email address</Text>
                <TextInput
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(0, 0, 0, 0.45)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                  accessibilityLabel="Email address input"
                  accessibilityHint="Enter your email to send OTP"
                  className="auth-input"
                />
                {emailError && <Text className="auth-error-text">{emailError}</Text>}
              </View>

              <Pressable
                onPress={handleSendOTP}
                disabled={!canSendOTP}
                className={clsx("auth-button", !canSendOTP && "auth-button-disabled")}
                accessibilityRole="button"
                accessibilityLabel="Send OTP code"
                accessibilityState={{ disabled: !canSendOTP }}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="auth-button-text">Send code</Text>
                )}
              </Pressable>
            </View>
          ) : (
            // OTP STEP
            <View className="auth-form">
              <View className="auth-field">
                <Text className="auth-label">
                  Enter the 6-digit code sent to your email
                </Text>
                <TextInput
                  value={otp}
                  onChangeText={(text) => {
                    setOtp(text.replace(/[^0-9]/g, "").slice(0, 6));
                    if (errors.otp) setErrors({ ...errors, otp: undefined });
                  }}
                  placeholder="000000"
                  placeholderTextColor="rgba(0, 0, 0, 0.45)"
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!isLoading}
                  accessibilityLabel="OTP code input"
                  accessibilityHint="Enter the 6-digit code from your email"
                  className="auth-input"
                  style={{
                    textAlign: "center",
                    fontSize: 20,
                    letterSpacing: 6,
                  }}
                />
                {otpError && <Text className="auth-error-text">{otpError}</Text>}
              </View>

              <Pressable
                onPress={handleVerifyOTP}
                disabled={!canVerifyOTP}
                className={clsx("auth-button", !canVerifyOTP && "auth-button-disabled")}
                accessibilityRole="button"
                accessibilityLabel="Verify OTP code"
                accessibilityState={{ disabled: !canVerifyOTP }}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="auth-button-text">Verify code</Text>
                )}
              </Pressable>

              <View className="auth-divider mt-6">
                <View className="flex-1 h-px bg-gray-200" />
                <Text className="text-gray-500 mx-3 text-sm">or</Text>
                <View className="flex-1 h-px bg-gray-200" />
              </View>

              <Pressable
                onPress={handleResendOTP}
                disabled={resendTimer > 0 || isLoading}
                className="mt-6"
                accessibilityRole="button"
                accessibilityLabel="Resend OTP code"
                accessibilityState={{ disabled: resendTimer > 0 || isLoading }}
              >
                <Text className="text-center text-blue-600 font-medium">
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Did not receive code? Resend"}
                </Text>
              </Pressable>

              <Pressable
                onPress={handleBackToEmail}
                disabled={isLoading}
                className="mt-4"
                accessibilityRole="button"
                accessibilityLabel="Back to email"
                accessibilityState={{ disabled: isLoading }}
              >
                <Text className="text-center text-gray-600">
                  <Ionicons name="chevron-back" size={14} /> Change email
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        <View className="auth-footer">
          <Text className="auth-footer-text">
            Do not have an account?{" "}
            <Link href="/(auth)/sign-up" className="text-blue-600 font-semibold">
              Sign up
            </Link>
          </Text>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default SignInScreen;
