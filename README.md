# Recurrly

Recurrly is a subscription tracking app built with Expo Router on the client and an Express API on the backend. The mobile app focuses on authentication, a subscription dashboard, search, and local subscription creation. The backend supports users, subscriptions, reminders, and security controls.

Documentation:

- Full combined: [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)
- Frontend only: [FRONTEND_DOCUMENTATION.md](FRONTEND_DOCUMENTATION.md)
- Backend only: [recurrly-backend/BACKEND_DOCUMENTATION.md](recurrly-backend/BACKEND_DOCUMENTATION.md)

## Stack

- Expo Router, React Native, TypeScript, NativeWind
- Clerk authentication and PostHog analytics
- Node.js, Express, MongoDB, Mongoose
- Arcjet request protection, Upstash Workflow, and Nodemailer email delivery

## Project Structure

- `app/` contains the live mobile routes.
- `components/` contains reusable mobile UI.
- `constants/` contains shared sample data, icons, images, and theme tokens.
- `lib/` contains helpers for formatting money and dates.
- `recurrly-backend/` contains the API, middleware, data models, and workflow code.

## Local Setup

1. Install dependencies for the Expo app.

   ```bash
   npm install
   ```

2. Add the required environment values to `.env`.

   ```bash
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   EXPO_PUBLIC_POSTHOG_API_KEY=your_posthog_api_key
   EXPO_PUBLIC_POSTHOG_HOST=your_posthog_host
   ```

3. Start the app.

   ```bash
   npx expo start
   ```

If you are running the backend too, install dependencies inside `recurrly-backend/`, configure its environment variables, and start it with `npm run dev`.

## What The App Does

- Redirects users into the auth flow or the main tab area based on Clerk session state.
- Shows a home dashboard with balance, upcoming renewals, and expandable subscription cards.
- Lets users add a subscription locally through a modal form.
- Lets users browse and search subscriptions by multiple fields.
- Shows account settings and supports sign-out.

## Notes

- `app-example/` is starter template content and is kept only as a reference.
- Some screens are still placeholders, including onboarding, insights, and the subscription detail route.
