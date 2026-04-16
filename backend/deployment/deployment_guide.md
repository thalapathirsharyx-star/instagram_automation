# Guide: Transitioning to Live Instagram Messaging

Your CRM is now fully optimized to handle real users, but Meta restricts incoming messages to **Test Accounts** until your App is approved and switched to **Live Mode**.

Follow these steps to enable messages from all Instagram users.

## 1. Required Permissions

In your [Meta Developer Dashboard](https://developers.facebook.com/apps/), go to **App Review > Permissions and Features**. You must request "Advanced Access" for:

*   **`instagram_manage_messages`**: (CRITICAL) Allows your server to receive webhooks and send replies.
*   **`instagram_basic`**: Allows the CRM to fetch the user's real name.
*   **`pages_manage_metadata`**: Ensures stable webhook delivery.

## 2. Preparing for App Review

Meta will require a **Screen Recording** of your app working. Since you need to show it working with a test account:

1.  Open your CRM Inbox.
2.  Send a message from your **Test Instagram Account**.
3.  Show the message appearing in the CRM.
4.  Show the CRM sending an auto-reply or manual reply.
5.  Explain that the app is a CRM tool for business owners to manage customer inquiries.

## 3. Switching to Live Mode

Once approved (usually takes 24–72 hours):
1.  Go to the top of your App Dashboard.
2.  Toggle **App Mode** from `Development` to `Live`.

## 4. Webhook Troubleshooting

If you still don't see messages after switching to Live:
*   **Check the Webhook Subscription:** In the App Settings, ensure the "messages" field is checked for the Instagram object.
*   **Page Access Token:** Ensure you are using a **Long-Lived Page Access Token**. User tokens expire quickly.
*   **Allow Access to Messages:** In the Instagram Mobile App, go to `Settings > Messages and Story Replies > Message Controls` and ensure **Allow Access to Messages** is toggled **ON** for the business account.

## Technical Improvements Added
- **Profile Auto-Fetch:** The CRM now automatically attempts to fetch the real name of anyone who messages you.
- **Enhanced Logging:** The backend now logs exactly why a message might be failing (e.g., "Meta rejected the token" or "Missing scope").
