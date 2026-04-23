/**
 * Create Subscription Modal
 *
 * Purpose:
 * - Collects structured subscription details from the user
 * - Validates form values before API submission
 * - Delegates creation to parent-provided callback and closes on success
 */
import React from "react";
import { clsx } from "clsx";
import dayjs from "dayjs";
import {
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import {
    SUBSCRIPTION_CATEGORIES,
    SUBSCRIPTION_FREQUENCIES,
} from "@/constants/data";
import BottomActionSheet from "@/components/BottomActionSheet";

type CreateSubscriptionModalProps = {
    visible: boolean;
    onClose: () => void;
    onCreate: (payload: {
        name: string;
        price: number;
        frequency: SubscriptionFrequency;
        category: SubscriptionCategory;
        paymentMethod: string;
        startDate: string;
    }) => Promise<void> | void;
};

const DEFAULT_FREQUENCY = SUBSCRIPTION_FREQUENCIES[0];
const DEFAULT_CATEGORY = SUBSCRIPTION_CATEGORIES[0];
const validPricePattern = /^\d+(?:[.,]\d{1,2})?$/;

/**
 * Renders a bottom-sheet style modal for creating a new subscription.
 */
const CreateSubscriptionModal = ({ visible, onClose, onCreate }: CreateSubscriptionModalProps) => {
    const [name, setName] = React.useState("");
    const [price, setPrice] = React.useState("");
    const [frequency, setFrequency] = React.useState<SubscriptionFrequency>(DEFAULT_FREQUENCY);
    const [category, setCategory] = React.useState<SubscriptionCategory>(DEFAULT_CATEGORY);
    const [paymentMethod, setPaymentMethod] = React.useState("");
    const [nameError, setNameError] = React.useState("");
    const [priceError, setPriceError] = React.useState("");
    const [paymentMethodError, setPaymentMethodError] = React.useState("");
    const [submitError, setSubmitError] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const normalizedName = name.trim();
    const normalizedPriceInput = price.trim();
    const hasThousandsSeparator = /\d[.,]\d{3}(?:[.,]|$)/.test(normalizedPriceInput);
    const hasMultipleSeparators = (normalizedPriceInput.match(/[.,]/g) || []).length > 1;
    const isPriceFormatValid =
        normalizedPriceInput.length > 0 &&
        !/\s/.test(normalizedPriceInput) &&
        !hasThousandsSeparator &&
        !hasMultipleSeparators &&
        validPricePattern.test(normalizedPriceInput);
    const parsedPrice = isPriceFormatValid
        ? Number(normalizedPriceInput.replace(",", "."))
        : Number.NaN;
    const isNameValid = normalizedName.length > 0;
    const isPriceValid = Number.isFinite(parsedPrice) && parsedPrice > 0;
    const normalizedPaymentMethod = paymentMethod.trim();
    const isPaymentMethodValid = normalizedPaymentMethod.length >= 2;
    const canSubmit = isNameValid && isPriceValid && isPaymentMethodValid && !isSubmitting;

    /**
     * Resets all input values and validation errors back to initial state.
     */
    const resetForm = () => {
        setName("");
        setPrice("");
        setFrequency(DEFAULT_FREQUENCY);
        setCategory(DEFAULT_CATEGORY);
        setPaymentMethod("");
        setNameError("");
        setPriceError("");
        setPaymentMethodError("");
        setSubmitError("");
    };

    /**
     * Validates inputs, submits the normalized payload, and closes on success.
     */
    const handleSubmit = async () => {
        if (isSubmitting) {
            return;
        }

        const nextNameError = isNameValid ? "" : "Name is required.";
        const nextPriceError = !price.trim()
            ? "Price is required."
                        : !isPriceFormatValid
                            ? "Use only digits and one optional decimal separator (max 2 decimals)."
                            : !Number.isFinite(parsedPrice) || parsedPrice <= 0
              ? "Enter a price greater than 0."
              : "";
        const nextPaymentMethodError = isPaymentMethodValid
            ? ""
            : "Payment method must be at least 2 characters.";

        setNameError(nextNameError);
        setPriceError(nextPriceError);
        setPaymentMethodError(nextPaymentMethodError);
        setSubmitError("");

        if (nextNameError || nextPriceError || nextPaymentMethodError) {
            return;
        }

        const startDate = dayjs();

        try {
            setIsSubmitting(true);

            await onCreate({
                name: normalizedName,
                price: parsedPrice,
                frequency,
                category,
                paymentMethod: normalizedPaymentMethod,
                startDate: startDate.toISOString(),
            });

            resetForm();
            onClose();
        } catch (error: any) {
            const message = error?.message || "Failed to create subscription.";
            setSubmitError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <BottomActionSheet
            visible={visible}
            onClose={onClose}
            title="New Subscription"
        >
            <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerClassName="modal-body"
            >
                <View className="auth-form">
                                <View className="auth-field">
                                    <Text className="auth-label">Name</Text>
                                    <TextInput
                                        value={name}
                                        onChangeText={(text) => {
                                            setName(text);
                                            if (nameError) {
                                                setNameError("");
                                            }
                                        }}
                                        placeholder="Enter subscription name"
                                        placeholderTextColor="rgba(0, 0, 0, 0.45)"
                                        autoCapitalize="words"
                                        className={clsx("auth-input", nameError && "auth-input-error")}
                                    />
                                    {nameError ? <Text className="auth-error">{nameError}</Text> : null}
                                </View>

                                <View className="auth-field">
                                    <Text className="auth-label">Price</Text>
                                    <TextInput
                                        value={price}
                                        onChangeText={(text) => {
                                            setPrice(text);
                                            if (priceError) {
                                                setPriceError("");
                                            }
                                        }}
                                        placeholder="0.00"
                                        placeholderTextColor="rgba(0, 0, 0, 0.45)"
                                        keyboardType="decimal-pad"
                                        autoCapitalize="none"
                                        className={clsx("auth-input", priceError && "auth-input-error")}
                                    />
                                    {priceError ? <Text className="auth-error">{priceError}</Text> : null}
                                </View>

                                <View className="auth-field">
                                    <Text className="auth-label">Frequency</Text>
                                    <View className="picker-row">
                                        {SUBSCRIPTION_FREQUENCIES.map((option) => {
                                            const isActive = frequency === option;

                                            return (
                                                <Pressable
                                                    key={option}
                                                    onPress={() => setFrequency(option)}
                                                    className={clsx("picker-option", isActive && "picker-option-active")}
                                                >
                                                    <Text
                                                        className={clsx(
                                                            "picker-option-text",
                                                            isActive && "picker-option-text-active",
                                                        )}
                                                    >
                                                        {option}
                                                    </Text>
                                                </Pressable>
                                            );
                                        })}
                                    </View>
                                </View>

                                <View className="auth-field">
                                    <Text className="auth-label">Category</Text>
                                    <View className="category-scroll">
                                        {SUBSCRIPTION_CATEGORIES.map((option) => {
                                            const isActive = category === option;

                                            return (
                                                <Pressable
                                                    key={option}
                                                    onPress={() => setCategory(option)}
                                                    className={clsx("category-chip", isActive && "category-chip-active")}
                                                >
                                                    <Text
                                                        className={clsx(
                                                            "category-chip-text",
                                                            isActive && "category-chip-text-active",
                                                        )}
                                                    >
                                                        {option}
                                                    </Text>
                                                </Pressable>
                                            );
                                        })}
                                    </View>
                                </View>

                                <View className="auth-field">
                                    <Text className="auth-label">Payment method</Text>
                                    <TextInput
                                        value={paymentMethod}
                                        onChangeText={(text) => {
                                            setPaymentMethod(text);
                                            if (paymentMethodError) {
                                                setPaymentMethodError("");
                                            }
                                            if (submitError) {
                                                setSubmitError("");
                                            }
                                        }}
                                        placeholder="UPI, card ending 1234, wallet, etc."
                                        placeholderTextColor="rgba(0, 0, 0, 0.45)"
                                        autoCapitalize="words"
                                        className={clsx("auth-input", paymentMethodError && "auth-input-error")}
                                    />
                                    {paymentMethodError ? <Text className="auth-error">{paymentMethodError}</Text> : null}
                                </View>

                                {submitError ? <Text className="auth-error">{submitError}</Text> : null}

                                <Pressable
                                    onPress={canSubmit ? handleSubmit : undefined}
                                    disabled={!canSubmit}
                                    className={clsx("auth-button", !canSubmit && "auth-button-disabled")}
                                    accessibilityRole="button"
                                    accessibilityLabel="Create subscription"
                                    accessibilityState={{ disabled: !canSubmit }}
                                >
                                    <Text className="auth-button-text">Create subscription</Text>
                                </Pressable>
                </View>
            </ScrollView>
        </BottomActionSheet>
    );
};

export default CreateSubscriptionModal;