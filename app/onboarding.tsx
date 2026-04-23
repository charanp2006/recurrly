/**
 * Onboarding Route
 *
 * Purpose:
 * - Exposes a dedicated onboarding path in the router
 * - Reuses the branded splash experience as the first-touch screen
 * - Keeps onboarding rendering lightweight and deterministic
 */
import AppSplash from "@/components/AppSplash";

/**
 * Renders the onboarding splash experience for the onboarding route.
 */
const Onboarding = () => {
    return <AppSplash />;
};

export default Onboarding;
