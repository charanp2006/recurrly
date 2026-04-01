import "@/global.css";
import { clsx } from "clsx";
import { useClerk, useSignIn } from "@clerk/expo";
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

type SignInFieldErrors = {
  identifier?: string;
  password?: string;
  code?: string;
};

const SignInScreen = () => {
  const { signIn, errors, fetchStatus } = useSignIn();
  const { setActive } = useClerk();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [clientErrors, setClientErrors] = React.useState<SignInFieldErrors>({});

  const isFetching = fetchStatus === "fetching";
  const isCodeStep = signIn?.status === "needs_client_trust";
  const globalError = errors.global?.[0]?.message ?? null;

  const emailError = clientErrors.identifier ?? errors.fields.identifier?.message;
  const passwordError = clientErrors.password ?? errors.fields.password?.message;
  const codeError = clientErrors.code ?? errors.fields.code?.message;

  const navigateToHome = async (sessionId: string) => {
    await setActive({
      session: sessionId,
      navigate: ({ decorateUrl }) => {
        const url = decorateUrl("/(tabs)");

        if (Platform.OS === "web" && typeof window !== "undefined" && url.startsWith("http")) {
          window.location.href = url;
          return;
        }

        router.replace(url as Href);
      },
    });
  };

  const validateCredentials = (): SignInFieldErrors => {
    const nextErrors: SignInFieldErrors = {};

    if (!emailAddress.trim()) {
      nextErrors.identifier = "Email is required.";
    } else if (!emailRegex.test(emailAddress.trim())) {
      nextErrors.identifier = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    }

    return nextErrors;
  };

  const handleSubmit = async () => {
    if (!signIn || isFetching) {
      return;
    }

    const nextErrors = validateCredentials();
    setClientErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const { error } = await signIn.password({
      emailAddress: emailAddress.trim(),
      password,
    });

    if (error) {
      return;
    }

    if (signIn.createdSessionId) {
      await navigateToHome(signIn.createdSessionId);
      return;
    }

    if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === "email_code",
      );

      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
      }
    }
  };

  const handleVerify = async () => {
    if (!signIn || isFetching) {
      return;
    }

    const trimmedCode = code.trim();
    if (trimmedCode.length < 6) {
      setClientErrors((prev) => ({ ...prev, code: "Enter the 6-digit code from your email." }));
      return;
    }

    setClientErrors((prev) => ({ ...prev, code: undefined }));

    const { error } = await signIn.mfa.verifyEmailCode({ code: trimmedCode });
    if (error) {
      return;
    }

    if (signIn.createdSessionId) {
      await navigateToHome(signIn.createdSessionId);
    }
  };

  const requestNewCode = async () => {
    if (!signIn || isFetching) {
      return;
    }

    await signIn.mfa.sendEmailCode();
  };

  const restartFlow = async () => {
    if (!signIn || isFetching) {
      return;
    }

    await signIn.reset();
    setCode("");
  };

  const isSubmitDisabled =
    isFetching || !emailAddress.trim() || !password || Boolean(emailError) || Boolean(passwordError);
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
            <Text className="auth-title">Welcome back</Text>
            <Text className="auth-subtitle">
              Sign in to continue managing your subscriptions
            </Text>
          </View>

          <View className="auth-card">
            {isCodeStep ? (
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
                    We sent a security code to your email to confirm this device.
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
                    <Text className="auth-button-text">Verify and continue</Text>
                  )}
                </Pressable>

                <Pressable onPress={requestNewCode} disabled={isFetching} className="auth-secondary-button">
                  <Text className="auth-secondary-button-text">Send a new code</Text>
                </Pressable>

                <Pressable onPress={restartFlow} disabled={isFetching} className="auth-secondary-button">
                  <Text className="auth-secondary-button-text">Use another account</Text>
                </Pressable>
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
                      textContentType="password"
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

                {globalError ? <Text className="auth-error">{globalError}</Text> : null}

                <Pressable
                  onPress={handleSubmit}
                  disabled={isSubmitDisabled}
                  className={clsx("auth-button", isSubmitDisabled && "auth-button-disabled")}
                >
                  {isFetching ? (
                    <ActivityIndicator color="#081126" />
                  ) : (
                    <Text className="auth-button-text">Sign in</Text>
                  )}
                </Pressable>

                <View className="auth-link-row">
                  <Text className="auth-link-copy">New to Recurrly?</Text>
                  <Link href="/(auth)/sign-up">
                    <Text className="auth-link">Create an account</Text>
                  </Link>
                </View>
              </View>
            )}
          </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default SignInScreen;
