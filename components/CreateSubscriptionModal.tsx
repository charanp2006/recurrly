import React from "react";
import { clsx } from "clsx";
import dayjs from "dayjs";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { icons } from "@/constants/icons";
import {
    SUBSCRIPTION_CATEGORIES,
    SUBSCRIPTION_CATEGORY_COLORS,
    SUBSCRIPTION_FREQUENCIES,
} from "@/constants/data";

type CreateSubscriptionModalProps = {
    visible: boolean;
    onClose: () => void;
    onCreate: (subscription: Subscription) => void;
};

const DEFAULT_FREQUENCY = SUBSCRIPTION_FREQUENCIES[0];
const DEFAULT_CATEGORY = SUBSCRIPTION_CATEGORIES[0];

const CreateSubscriptionModal = ({ visible, onClose, onCreate }: CreateSubscriptionModalProps) => {
    const [name, setName] = React.useState("");
    const [price, setPrice] = React.useState("");
    const [frequency, setFrequency] = React.useState<SubscriptionFrequency>(DEFAULT_FREQUENCY);
    const [category, setCategory] = React.useState<SubscriptionCategory>(DEFAULT_CATEGORY);
    const [nameError, setNameError] = React.useState("");
    const [priceError, setPriceError] = React.useState("");

    const normalizedName = name.trim();
    const parsedPrice = Number(price.replace(/,/g, "."));
    const isNameValid = normalizedName.length > 0;
    const isPriceValid = Number.isFinite(parsedPrice) && parsedPrice > 0;
    const canSubmit = isNameValid && isPriceValid;

    const resetForm = () => {
        setName("");
        setPrice("");
        setFrequency(DEFAULT_FREQUENCY);
        setCategory(DEFAULT_CATEGORY);
        setNameError("");
        setPriceError("");
    };

    const handleSubmit = () => {
        const nextNameError = isNameValid ? "" : "Name is required.";
        const nextPriceError = !price.trim()
            ? "Price is required."
            : !Number.isFinite(parsedPrice) || parsedPrice <= 0
              ? "Enter a price greater than 0."
              : "";

        setNameError(nextNameError);
        setPriceError(nextPriceError);

        if (nextNameError || nextPriceError) {
            return;
        }

        const startDate = dayjs();
        const renewalDate = startDate.add(1, frequency === "Monthly" ? "month" : "year");

        onCreate({
            id: `subscription-${startDate.valueOf()}`,
            name: normalizedName,
            price: parsedPrice,
            frequency,
            category,
            status: "active",
            startDate: startDate.toISOString(),
            renewalDate: renewalDate.toISOString(),
            icon: icons.wallet,
            billing: frequency,
            color: SUBSCRIPTION_CATEGORY_COLORS[category],
            currency: "INR",
        });

        resetForm();
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            presentationStyle="overFullScreen"
            onRequestClose={onClose}
        >
            <View className="modal-overlay">
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    className="mt-auto"
                >
                    <View className="modal-container">
                        <View className="modal-header">
                            <Text className="modal-title">New Subscription</Text>

                            <Pressable
                                onPress={onClose}
                                accessibilityRole="button"
                                accessibilityLabel="Close modal"
                                hitSlop={10}
                                className="modal-close"
                            >
                                <Text className="modal-close-text">×</Text>
                            </Pressable>
                        </View>

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

                                <Pressable
                                    onPress={handleSubmit}
                                    className={clsx("auth-button", !canSubmit && "auth-button-disabled")}
                                >
                                    <Text className="auth-button-text">Create subscription</Text>
                                </Pressable>
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

export default CreateSubscriptionModal;