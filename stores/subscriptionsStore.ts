/**
 * Subscriptions Context & Store
 * 
 * Purpose:
 * - Manage global subscription state
 * - Share subscription data across screens
 * - Handle CRUD operations for subscriptions
 * - Ensure newly created subscriptions appear immediately
 * 
 * Key Features:
 * - Centralized subscription state using Zustand
 * - Real-time updates across components
 * - Search and filter capabilities
 * - Optimistic UI updates
 * 
 * Dependencies:
 * - Zustand for state management
 * - axios for API calls
 */

import { create } from 'zustand';
import { icons } from '@/constants/icons';
import { SUBSCRIPTION_CATEGORY_COLORS } from '@/constants/data';
import { apiClient, toApiErrorMessage } from '@/lib/apiClient';

interface CreateSubscriptionInput {
  name: string;
  price: number;
  frequency: SubscriptionFrequency;
  category: SubscriptionCategory;
  paymentMethod: string;
  startDate: string;
}

type ApiSubscription = {
  _id: string;
  name: string;
  price: number;
  currency?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  category?: string;
  paymentMethod?: string;
  status?: string;
  startDate?: string;
  renewalDate?: string;
};

const mapFrequencyToApi = (frequency: SubscriptionFrequency) =>
  frequency === 'Yearly' ? 'yearly' : 'monthly';

const mapFrequencyToUi = (frequency: ApiSubscription['frequency']): SubscriptionFrequency =>
  (() => {
    if (frequency === 'yearly') {
      return 'Yearly';
    }

    if (frequency === 'monthly') {
      return 'Monthly';
    }

    if (frequency === 'daily' || frequency === 'weekly') {
      console.warn(`[Subscriptions] Unsupported frequency "${frequency}" from API. Falling back to Monthly.`);
      return 'Monthly';
    }

    return 'Monthly';
  })();

const CATEGORY_KEY_TO_UI: Record<string, SubscriptionCategory> = {
  entertainment: 'Entertainment',
  ai_tools: 'AI Tools',
  developer_tools: 'Developer Tools',
  design: 'Design',
  productivity: 'Productivity',
  cloud: 'Cloud',
  music: 'Music',
  other: 'Other',
};

const UI_TO_CATEGORY_KEY: Record<SubscriptionCategory, string> = {
  Entertainment: 'entertainment',
  'AI Tools': 'ai_tools',
  'Developer Tools': 'developer_tools',
  Design: 'design',
  Productivity: 'productivity',
  Cloud: 'cloud',
  Music: 'music',
  Other: 'other',
};

const normalizeCategoryKey = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, '_');

const mapCategoryToApi = (category: SubscriptionCategory) => {
  return UI_TO_CATEGORY_KEY[category] || 'other';
};

const mapApiCategoryToUi = (category?: string): SubscriptionCategory => {
  if (!category) {
    return 'Other';
  }

  const normalized = normalizeCategoryKey(category);
  return CATEGORY_KEY_TO_UI[normalized] || 'Other';
};

const normalizeApiSubscription = (subscription: ApiSubscription): Subscription => {
  const category = mapApiCategoryToUi(subscription.category);
  const billing = mapFrequencyToUi(subscription.frequency);

  return {
    id: subscription._id,
    icon: icons.wallet,
    name: subscription.name,
    category,
    paymentMethod: subscription.paymentMethod || 'Not specified',
    status: subscription.status || 'active',
    startDate: subscription.startDate,
    renewalDate: subscription.renewalDate,
    billing,
    frequency: billing,
    currency: subscription.currency || 'INR',
    price: subscription.price,
    color: SUBSCRIPTION_CATEGORY_COLORS[category],
  };
};

const toCreatePayload = (subscription: CreateSubscriptionInput) => ({
  name: subscription.name,
  price: subscription.price,
  currency: 'INR',
  frequency: mapFrequencyToApi(subscription.frequency),
  category: mapCategoryToApi(subscription.category),
  paymentMethod: subscription.paymentMethod,
  startDate: subscription.startDate,
  status: 'active',
});

/**
 * Subscription Type Definition
 */
/**
 * Store Type Definition
 */
interface SubscriptionsStore {
  subscriptions: Subscription[];
  isLoading: boolean;
  error: string | null;
  hasLoaded: boolean;
  
  // Actions
  setSubscriptions: (subs: Subscription[]) => void;
  addSubscription: (sub: Subscription) => void;
  updateSubscription: (id: string, sub: Subscription) => void;
  deleteSubscription: (id: string) => void;
  fetchSubscriptions: (token: string) => Promise<void>;
  createSubscription: (sub: CreateSubscriptionInput, token: string) => Promise<Subscription>;
  clearError: () => void;
  reset: () => void;
}

/**
 * Create Zustand store for subscriptions
 */
export const useSubscriptionsStore = create<SubscriptionsStore>((set, get) => ({
  subscriptions: [],
  isLoading: false,
  error: null,
  hasLoaded: false,

  /**
   * Set subscriptions directly
   */
  setSubscriptions: (subs: Subscription[]) => {
    console.log('[Subscriptions] Setting subscriptions:', subs.length);
    set({ subscriptions: subs, error: null });
  },

  /**
   * Add a new subscription (prepend to list)
   */
  addSubscription: (sub: Subscription) => {
    console.log('[Subscriptions] Adding subscription:', sub.name);
    set((state) => ({
      subscriptions: [sub, ...state.subscriptions],
    }));
  },

  /**
   * Update an existing subscription
   */
  updateSubscription: (id: string, updatedSub: Subscription) => {
    console.log('[Subscriptions] Updating subscription:', id);
    set((state) => ({
      subscriptions: state.subscriptions.map((sub) =>
        sub.id === id ? { ...sub, ...updatedSub } : sub
      ),
    }));
  },

  /**
   * Delete a subscription
   */
  deleteSubscription: (id: string) => {
    console.log('[Subscriptions] Deleting subscription:', id);
    set((state) => ({
      subscriptions: state.subscriptions.filter((sub) => sub.id !== id),
    }));
  },

  /**
   * Fetch subscriptions from API
   */
  fetchSubscriptions: async (token: string) => {
    try {
      set({ isLoading: true, error: null });
      console.log('[Subscriptions] Fetching subscriptions from API');
      
      const response = await apiClient.get('/subscriptions/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const apiSubscriptions = response.data.data || [];
      const subscriptions = apiSubscriptions.map(normalizeApiSubscription);
      console.log('[Subscriptions] Fetched successfully:', subscriptions.length);
      set({ subscriptions, isLoading: false, hasLoaded: true });
    } catch (error) {
      const errorMessage = toApiErrorMessage(error);
      console.error('[Subscriptions] Error fetching:', errorMessage);
      set({ error: errorMessage, isLoading: false });
    }
  },

  /**
   * Create a new subscription
   */
  createSubscription: async (sub: CreateSubscriptionInput, token: string) => {
    try {
      console.log('[Subscriptions] Creating subscription:', sub.name);
      set({ isLoading: true, error: null });

      const response = await apiClient.post('/subscriptions', toCreatePayload(sub), {
        headers: { Authorization: `Bearer ${token}` },
      });

      const createdPayload = response?.data;
      const apiSubscription =
        createdPayload?.data?.subscription || createdPayload?.subscription;

      if (!apiSubscription || typeof apiSubscription !== 'object' || !apiSubscription._id) {
        throw new Error('Invalid subscription payload from server. Please try again.');
      }

      const createdSub = normalizeApiSubscription(apiSubscription as ApiSubscription);
      
      // Immediately add to store
      get().addSubscription(createdSub);
      set({ isLoading: false });
      
      console.log('[Subscriptions] Subscription created successfully');
      return createdSub;
    } catch (error) {
      const errorMessage = toApiErrorMessage(error);
      console.error('[Subscriptions] Error creating:', errorMessage);
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  /**
   * Clear error message
   */
  clearError: () => {
    console.log('[Subscriptions] Clearing error');
    set({ error: null });
  },

  /**
   * Reset store to initial state
   */
  reset: () => {
    console.log('[Subscriptions] Resetting store');
    set({
      subscriptions: [],
      isLoading: false,
      error: null,
      hasLoaded: false,
    });
  },
}));
