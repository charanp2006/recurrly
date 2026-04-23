/**
 * Authentication Context & Provider
 * 
 * Purpose:
 * - Manage OTP authentication state
 * - Handle token storage and validation
 * - Provide authentication hooks for components
 * - Centralize auth API calls
 * 
 * Key Features:
 * - OTP-based login and signup
 * - Secure token storage
 * - User profile management
 * - Session persistence
 * 
 * Dependencies:
 * - React Context API
 * - expo-secure-store for token persistence
 * - axios for API calls
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import {
  apiClient,
  checkApiHealth,
  configureAuthLifecycle,
  getBaseURL,
  toApiErrorMessage,
} from '@/lib/apiClient';
import { isJwtExpired } from '@/lib/authToken';
import { useSubscriptionsStore } from '@/stores/subscriptionsStore';

const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
};

/**
 * Auth Context Type Definition
 */
interface AuthContextType {
  user: any | null;
  token: string | null;
  isLoading: boolean;
  isSignedIn: boolean;
  sendOTP: (email: string, name?: string) => Promise<any>;
  verifyOTP: (email: string, otp: string) => Promise<any>;
  resendOTP: (email: string) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<any>;
  uploadProfileImage: (base64: string) => Promise<any>;
  getProfile: () => Promise<any>;
}

/**
 * Create Auth Context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider Component
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(async () => {
    useSubscriptionsStore.getState().reset();
    setToken(null);
    setUser(null);

    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
    } catch (storageError) {
      console.error('[Auth] Failed to clear secure storage:', storageError);
    }
  }, []);

  const persistSession = useCallback(async (nextToken: string, nextUser: any) => {
    await SecureStore.setItemAsync(STORAGE_KEYS.TOKEN, nextToken);
    await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(nextUser));

    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const refreshAccessToken = useCallback(async () => {
    if (!token || isJwtExpired(token)) {
      return null;
    }

    try {
      const response = await apiClient.post(
        '/auth/refresh-token',
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const refreshedToken = response?.data?.data?.token;
      const nextUser = response?.data?.data?.user ?? user;

      if (typeof refreshedToken !== 'string' || isJwtExpired(refreshedToken)) {
        return null;
      }

      await persistSession(refreshedToken, nextUser);
      return refreshedToken;
    } catch {
      return null;
    }
  }, [persistSession, token, user]);

  const handleAuthFailure = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  useEffect(() => {
    configureAuthLifecycle({
      getAccessToken: () => token,
      refreshAccessToken,
      onAuthFailure: handleAuthFailure,
    });
  }, [handleAuthFailure, refreshAccessToken, token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    if (isJwtExpired(token)) {
      handleAuthFailure();
    }
  }, [handleAuthFailure, token]);

  /**
   * Initialize auth state from secure storage
   */
  useEffect(() => {
    console.log('[API BASE URL]', getBaseURL());

    const initializeAuth = async () => {
      try {
        console.log('[Auth] Initializing auth state...');
        const storedToken = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN);
        const storedUser = await SecureStore.getItemAsync(STORAGE_KEYS.USER);

        if (storedToken && storedUser) {
          if (isJwtExpired(storedToken)) {
            console.log('[Auth] Stored token expired. Clearing session.');
            await clearSession();
            return;
          }

          try {
            const parsedUser = JSON.parse(storedUser);
            setToken(storedToken);
            setUser(parsedUser);
            console.log('[Auth] Auth state restored from storage');
          } catch (parseError) {
            console.error('[Auth] Invalid stored user JSON. Clearing auth storage.', parseError);
            await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN);
            await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('[Auth] Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [clearSession]);

  /**
   * Send OTP to email
   */
  const sendOTP = useCallback(async (email: string, name?: string) => {
    try {
      console.log('[Auth] Sending OTP');

      try {
        await checkApiHealth();
      } catch (healthError) {
        const healthMessage = toApiErrorMessage(healthError);
        console.error('[Auth] Health check failed before send OTP:', healthMessage);
        throw new Error('Cannot connect to server. Ensure same network or correct API URL.');
      }

      const response = await apiClient.post('/auth/send-otp', {
        email,
        ...(name && { name }),
      });
      console.log('[Auth] OTP sent successfully');
      return response.data;
    } catch (error) {
      const message = toApiErrorMessage(error);
      console.error('[Auth] Error sending OTP:', message);
      throw new Error(message);
    }
  }, []);

  /**
   * Verify OTP and sign in
   */
  const verifyOTP = useCallback(async (email: string, otp: string) => {
    try {
      console.log('[Auth] Verifying OTP');
      const response = await apiClient.post('/auth/verify-otp', {
        email,
        otp,
      });

      const responseData = response?.data?.data;
      const newToken = responseData?.token;
      const userData = responseData?.user;

      if (
        !responseData ||
        typeof newToken !== 'string' ||
        !newToken ||
        !userData ||
        typeof userData !== 'object'
      ) {
        throw new Error('Invalid verification response. Please try again.');
      }

      if (isJwtExpired(newToken)) {
        throw new Error('Session token expired. Please request a new code.');
      }

      await persistSession(newToken, userData);

      console.log('[Auth] OTP verified and user logged in');
      return response.data;
    } catch (error) {
      const message = toApiErrorMessage(error);
      console.error('[Auth] Error verifying OTP:', message);
      throw new Error(message);
    }
  }, [persistSession]);

  /**
   * Resend OTP
   */
  const resendOTP = useCallback(async (email: string) => {
    try {
      console.log('[Auth] Resending OTP');
      const response = await apiClient.post('/auth/resend-otp', { email });
      console.log('[Auth] OTP resent successfully');
      return response.data;
    } catch (error) {
      const message = toApiErrorMessage(error);
      console.error('[Auth] Error resending OTP:', message);
      throw new Error(message);
    }
  }, []);

  /**
   * Sign out user
   */
  const signOut = useCallback(async () => {
    try {
      console.log('[Auth] Signing out...');
      if (token) {
        await apiClient.post(
          '/auth/sign-out',
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      console.log('[Auth] User signed out successfully');
    } catch (error) {
      console.error('[Auth] Error signing out:', toApiErrorMessage(error));
    } finally {
      await clearSession();
    }
  }, [clearSession, token]);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(
    async (data: any) => {
      try {
        console.log('[Auth] Updating user profile');
        const response = await apiClient.put('/users/profile', data, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const updatedUser = response.data.data;
        setUser(updatedUser);
        await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(updatedUser));

        console.log('[Auth] Profile updated successfully');
        return response.data;
      } catch (error) {
        const message = toApiErrorMessage(error);
        console.error('[Auth] Error updating profile:', message);
        throw new Error(message);
      }
    },
    [token]
  );

  /**
   * Get user profile
   */
  const getProfile = useCallback(async () => {
    try {
      console.log('[Auth] Fetching user profile');
      const response = await apiClient.get('/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('[Auth] Profile fetched successfully');
      return response.data;
    } catch (error) {
      const message = toApiErrorMessage(error);
      console.error('[Auth] Error fetching profile:', message);
      throw new Error(message);
    }
  }, [token]);

  /**
   * Upload profile image through backend -> Cloudinary
   */
  const uploadProfileImage = useCallback(
    async (base64: string) => {
      try {
        console.log('[Auth] Uploading profile image');
        const response = await apiClient.post(
          '/upload/profile-image',
          { base64 },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const updatedUser = response.data.data?.user;
        if (updatedUser) {
          setUser(updatedUser);
          await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        }

        console.log('[Auth] Profile image uploaded successfully');
        return response.data;
      } catch (error) {
        const message = toApiErrorMessage(error);
        console.error('[Auth] Error uploading profile image:', message);
        throw new Error(message);
      }
    },
    [token]
  );

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isSignedIn: !!token && !!user && !isJwtExpired(token),
    sendOTP,
    verifyOTP,
    resendOTP,
    signOut,
    updateProfile,
    uploadProfileImage,
    getProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth Hook
 * Usage: const { user, token, sendOTP, ... } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
