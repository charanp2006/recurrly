import "@/global.css";
import { clsx } from "clsx";
import { useSignUp } from "@clerk/expo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { type Href, Link, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView as RNKeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { styled } from "nativewind";

const SafeAreaView = styled(RNSafeAreaView);
const KeyboardAwareScrollView = styled(RNKeyboardAwareScrollView);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SignUpFieldErrors = {
  emailAddress?: string;
  password?: string;
  confirmPassword?: string;
  code?: string;
};

const SignUpScreen = () => {
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [isVerificationStep, setIsVerificationStep] = React.useState(false);
  const [clientErrors, setClientErrors] = React.useState<SignUpFieldErrors>({});

  const isFetching = fetchStatus === "fetching";
  const hasPendingEmailVerification =
    signUp?.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address");
  const requiresEmailCode = isVerificationStep || hasPendingEmailVerification;

  const globalError = errors.global?.[0]?.message ?? null;
  const emailError = clientErrors.emailAddress ?? errors.fields.emailAddress?.message;
  const passwordError = clientErrors.password ?? errors.fields.password?.message;
  const codeError = clientErrors.code ?? errors.fields.code?.message;

  const finalizeAndNavigate = async () => {
    if (!signUp) {
      return;
    }

    await signUp.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          router.replace("/(tabs)");
          return;
        }

        const url = decorateUrl("/(tabs)");
        if (Platform.OS === "web" && typeof window !== "undefined" && url.startsWith("http")) {
          window.location.href = url;
          return;
        }

        router.replace(url as Href);
      },
    });
  };

  const validateSignUp = (): SignUpFieldErrors => {
    const nextErrors: SignUpFieldErrors = {};

    if (!emailAddress.trim()) {
      nextErrors.emailAddress = "Email is required.";
    } else if (!emailRegex.test(emailAddress.trim())) {
      nextErrors.emailAddress = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 8) {
      nextErrors.password = "Use at least 8 characters.";
    } else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      nextErrors.password = "Include both letters and numbers.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Confirm your password.";
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    return nextErrors;
  };

  const handleSubmit = async () => {
    if (!signUp || isFetching) {
      return;
    }

    const nextErrors = validateSignUp();
    setClientErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const { error } = await signUp.password({
      emailAddress: emailAddress.trim(),
      password,
    });

    if (error) {
      return;
    }

    if (signUp.status === "complete") {
      await finalizeAndNavigate();
      return;
    }

    const { error: sendCodeError } = await signUp.verifications.sendEmailCode();
    if (!sendCodeError) {
      setIsVerificationStep(true);
    }
  };

  const handleVerify = async () => {
    if (!signUp || isFetching) {
      return;
    }

    const trimmedCode = code.trim();
    if (trimmedCode.length < 6) {
      setClientErrors((prev) => ({ ...prev, code: "Enter the 6-digit code from your email." }));
      return;
    }

    setClientErrors((prev) => ({ ...prev, code: undefined }));

    const { error } = await signUp.verifications.verifyEmailCode({ code: trimmedCode });
    if (error) {
      return;
    }

    if (signUp.status === "complete") {
      await finalizeAndNavigate();
    }
  };

  const resendCode = async () => {
    if (!signUp || isFetching) {
      return;
    }

    await signUp.verifications.sendEmailCode();
  };

  const restartSignUp = async () => {
    if (!signUp || isFetching) {
      return;
    }

    await signUp.reset();
    setCode("");
    setIsVerificationStep(false);
  };

  const isSubmitDisabled =
    isFetching ||
    !emailAddress.trim() ||
    !password ||
    !confirmPassword ||
    Boolean(emailError) ||
    Boolean(passwordError) ||
    Boolean(clientErrors.confirmPassword);
  const isVerifyDisabled = isFetching || code.trim().length < 6;

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
            <Text className="auth-title">Create account</Text>
            <Text className="auth-subtitle">
              Sign up to start managing your subscriptions
            </Text>
          </View>

          <View className="auth-card">
            {requiresEmailCode ? (
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Verification code</Text>
                  <TextInput
                    value={code}
                    onChangeText={setCode}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="rgba(0, 0, 0, 0.45)"
                    keyboardType="number-pad"
                    autoCapitalize="none"
                    textContentType="oneTimeCode"
                    className={clsx("auth-input", codeError && "auth-input-error")}
                  />
                  {codeError ? <Text className="auth-error">{codeError}</Text> : null}
                  <Text className="auth-helper">
                    Check your inbox and verify your email to secure your account.
                  </Text>
                </View>

                {globalError ? <Text className="auth-error">{globalError}</Text> : null}

                <Pressable
                  onPress={handleVerify}
                  disabled={isVerifyDisabled}
                  className={clsx("auth-button", isVerifyDisabled && "auth-button-disabled")}
                >
                  {isFetching ? (
                    <ActivityIndicator color="#081126" />
                  ) : (
                    <Text className="auth-button-text">Verify and get started</Text>
                  )}
                </Pressable>

                <Pressable onPress={resendCode} disabled={isFetching} className="auth-secondary-button">
                  <Text className="auth-secondary-button-text">Send a new code</Text>
                </Pressable>

                <Pressable onPress={restartSignUp} disabled={isFetching} className="auth-secondary-button">
                  <Text className="auth-secondary-button-text">Start over</Text>
                </Pressable>

                <View nativeID="clerk-captcha" />
              </View>
            ) : (
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Email</Text>
                  <TextInput
                    value={emailAddress}
                    onChangeText={setEmailAddress}
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(0, 0, 0, 0.45)"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    className={clsx("auth-input", emailError && "auth-input-error")}
                  />
                  {emailError ? <Text className="auth-error">{emailError}</Text> : null}
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Password</Text>
                  <View className="relative">
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter your password"
                      placeholderTextColor="rgba(0, 0, 0, 0.45)"
                      secureTextEntry={!isPasswordVisible}
                      textContentType="newPassword"
                      className={clsx("auth-input", passwordError && "auth-input-error")}
                      style={{ paddingRight: 52 }}
                    />
                    <Pressable
                      onPress={() => setIsPasswordVisible((prev) => !prev)}
                      accessibilityRole="button"
                      accessibilityLabel={isPasswordVisible ? "Hide password" : "Show password"}
                      hitSlop={10}
                      style={{ position: "absolute", right: 16, top: "50%", marginTop: -10 }}
                    >
                      <Ionicons
                        name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color="#3f5478"
                      />
                    </Pressable>
                  </View>
                  {passwordError ? <Text className="auth-error">{passwordError}</Text> : null}
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Confirm password</Text>
                  <View className="relative">
                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Re-enter your password"
                      placeholderTextColor="rgba(0, 0, 0, 0.45)"
                      secureTextEntry={!isConfirmPasswordVisible}
                      textContentType="newPassword"
                      className={clsx(
                        "auth-input",
                        clientErrors.confirmPassword && "auth-input-error",
                      )}
                      style={{ paddingRight: 52 }}
                    />
                    <Pressable
                      onPress={() => setIsConfirmPasswordVisible((prev) => !prev)}
                      accessibilityRole="button"
                      accessibilityLabel={isConfirmPasswordVisible ? "Hide confirm password" : "Show confirm password"}
                      hitSlop={10}
                      style={{ position: "absolute", right: 16, top: "50%", marginTop: -10 }}
                    >
                      <Ionicons
                        name={isConfirmPasswordVisible ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color="#3f5478"
                      />
                    </Pressable>
                  </View>
                  {clientErrors.confirmPassword ? (
                    <Text className="auth-error">{clientErrors.confirmPassword}</Text>
                  ) : null}
                </View>

                {globalError ? <Text className="auth-error">{globalError}</Text> : null}

                <Pressable
                  onPress={handleSubmit}
                  disabled={isSubmitDisabled}
                  className={clsx("auth-button", isSubmitDisabled && "auth-button-disabled")}
                >
                  {isFetching ? (
                    <ActivityIndicator color="#081126" />
                  ) : (
                    <Text className="auth-button-text">Create account</Text>
                  )}
                </Pressable>

                <View className="auth-link-row">
                  <Text className="auth-link-copy">Already have an account?</Text>
                  <Link href="/(auth)/sign-in">
                    <Text className="auth-link">Sign in</Text>
                  </Link>
                </View>

                <View nativeID="clerk-captcha" />
              </View>
            )}
          </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default SignUpScreen;
