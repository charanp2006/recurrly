/**
 * Profile Screen
 * 
 * Purpose:
 * - Display user profile details
 * - Allow profile updates via modal
 * - Support profile image upload
 * 
 * Key Features:
 * - User info card (name/email/image)
 * - Edit profile modal (name + image URL)
 * - Secure logout
 * - Accessible controls
 * 
 * Dependencies:
 * - AuthContext for user/session state
 * - React Native Modal for profile edit UX
 */

import React from "react";
import { clsx } from "clsx";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import images from "@/constants/images";
import "@/global.css";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "react-native-toast-notifications";

const SafeAreaView = styled(RNSafeAreaView);
const StyledScrollView = styled(ScrollView);
const StyledImage = styled(Image);

const Settings = () => {
  const { user, isLoading, signOut, updateProfile, uploadProfileImage } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = React.useState(false);
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
  const [name, setName] = React.useState("");
  const [profileImage, setProfileImage] = React.useState("");
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);

  const fullName = user?.name || "Recurrly Member";
  const email = user?.email || "No email available";
  const userImage = user?.profileImage || null;

  const openEditModal = () => {
    setName(user?.name || "");
    setProfileImage(user?.profileImage || "");
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
  };

  const handleSaveProfile = async () => {
    try {
      if (isSavingProfile) return;

      if (!name.trim()) {
        toast.show("Name is required", { type: "warning" });
        return;
      }

      setIsSavingProfile(true);
      console.log("[Profile] Updating profile");

      await updateProfile({
        name: name.trim(),
        profileImage: profileImage.trim() || undefined,
      });

      toast.show("Profile updated successfully", { type: "success" });
      setIsEditModalVisible(false);
    } catch (error: any) {
      console.error("[Profile] Update failed:", error);
      toast.show(error?.response?.data?.message || "Failed to update profile", {
        type: "danger",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePickImage = async () => {
    try {
      if (isUploadingImage) return;
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        toast.show("Photo library permission is required", { type: "warning" });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (result.canceled || !result.assets?.[0]?.base64) {
        return;
      }

      setIsUploadingImage(true);
      const mimeType = result.assets[0].mimeType || "image/jpeg";
      const dataUri = `data:${mimeType};base64,${result.assets[0].base64}`;

      console.log("[Profile] Uploading selected image");
      const response = await uploadProfileImage(dataUri);
      const uploadedUrl = response?.data?.imageUrl;
      if (uploadedUrl) {
        setProfileImage(uploadedUrl);
        toast.show("Profile image updated", { type: "success" });
      } else {
        toast.show("Failed to update profile image", { type: "danger" });
      }
    } catch (error: any) {
      console.error("[Profile] Image upload failed:", error);
      toast.show(error?.response?.data?.message || "Failed to upload image", { type: "danger" });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSignOut = async () => {
    if (isSigningOut) {
      return;
    }

    try {
      setIsSigningOut(true);
      await signOut();
      router.replace("/(auth)/sign-in");
    } catch (error: any) {
      const errorMessage =
        error?.message || error?.response?.data?.message || "Failed to sign out";
      toast.show(errorMessage, { type: "danger" });
    } finally {
      setIsSigningOut(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="settings-safe-area items-center justify-center">
        <ActivityIndicator size="large" color="#081126" />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView className="settings-safe-area items-center justify-center px-6">
        <Text className="text-lg font-sans-semibold text-primary">You are signed out.</Text>
        <Text className="mt-2 text-center text-sm font-sans-medium text-muted-foreground">
          Please sign in again to access your profile.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="settings-safe-area">
      <StyledScrollView
        className="settings-scroll"
        contentContainerClassName="settings-content"
        showsVerticalScrollIndicator={false}
      >
        <Text className="settings-title">Profile</Text>
        <Text className="settings-subtitle">Manage your account details</Text>

        <View className="settings-profile-card">
          <StyledImage
            source={userImage ? { uri: userImage } : images.avatar}
            className="settings-avatar"
          />
          <View className="settings-profile-copy">
            <Text className="settings-name" numberOfLines={1}>{fullName}</Text>
            <Text className="settings-email" numberOfLines={1}>{email}</Text>
            <View className="settings-badge">
              <Text className="settings-badge-text">Active account</Text>
            </View>
          </View>
        </View>

        <View className="settings-section">
          <Text className="settings-section-title">Account details</Text>
          <View className="settings-card">
            <View className="settings-row">
              <Text className="settings-row-label">Name</Text>
              <Text className="settings-row-value">{fullName}</Text>
            </View>
            <View className="settings-row settings-row-divider">
              <Text className="settings-row-label">Email</Text>
              <Text className="settings-row-value">{email}</Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={openEditModal}
          className="auth-button"
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
        >
          <Text className="auth-button-text">Edit profile</Text>
        </Pressable>

        <Pressable
          onPress={handleSignOut}
          disabled={isSigningOut}
          className={clsx("settings-logout", isSigningOut && "settings-logout-disabled")}
          accessibilityRole="button"
          accessibilityLabel="Log out"
          accessibilityState={{ disabled: isSigningOut }}
        >
          {isSigningOut ? (
            <ActivityIndicator color="#fff9e3" />
          ) : (
            <Text className="settings-logout-text">Log out</Text>
          )}
        </Pressable>
      </StyledScrollView>

      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeEditModal}
      >
        <View className="modal-overlay">
          <View className="modal-container">
            <View className="modal-header">
              <Text className="modal-title">Edit Profile</Text>
              <Pressable onPress={closeEditModal} className="modal-close" accessibilityLabel="Close edit profile modal">
                <Text className="modal-close-text">x</Text>
              </Pressable>
            </View>

            <View className="modal-body">
              <View className="auth-field">
                <Text className="auth-label">Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Your full name"
                  placeholderTextColor="rgba(0, 0, 0, 0.45)"
                  className="auth-input"
                />
              </View>

              <View className="auth-field">
                <Text className="auth-label">Profile image URL</Text>
                <TextInput
                  value={profileImage}
                  onChangeText={setProfileImage}
                  placeholder="https://..."
                  placeholderTextColor="rgba(0, 0, 0, 0.45)"
                  autoCapitalize="none"
                  className="auth-input"
                />
                <Pressable
                  onPress={handlePickImage}
                  disabled={isUploadingImage}
                  className={clsx("mt-3 rounded-xl bg-secondary px-4 py-3", isUploadingImage && "opacity-70")}
                  accessibilityRole="button"
                  accessibilityLabel="Choose profile image"
                  accessibilityState={{ disabled: isUploadingImage }}
                >
                  {isUploadingImage ? (
                    <ActivityIndicator size="small" color="#081126" />
                  ) : (
                    <Text className="text-center font-sans-semibold text-primary">Choose from gallery</Text>
                  )}
                </Pressable>
              </View>

              <Pressable
                onPress={handleSaveProfile}
                disabled={isSavingProfile}
                className={clsx("auth-button", isSavingProfile && "auth-button-disabled")}
                accessibilityRole="button"
                accessibilityLabel="Save profile"
                accessibilityState={{ disabled: isSavingProfile }}
              >
                {isSavingProfile ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="auth-button-text">Save changes</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Settings;
