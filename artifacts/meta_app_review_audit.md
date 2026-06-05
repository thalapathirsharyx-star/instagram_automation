# Meta App Review Audit Report: Flazly
**Auditor**: Senior Meta App Review Consultant
**Objective**: Identify every issue that could cause rejection, delay, or require resubmission.

---

## 1. Meta App Review Readiness

**Required Permissions Requested:**
`instagram_manage_messages`, `instagram_manage_comments`, `pages_manage_metadata`, `pages_read_engagement`, `pages_show_list`, `instagram_basic`, `business_management`

*   **Risk Area (CRITICAL)**: You are requesting `business_management`. This permission is extremely difficult to get approved and is heavily scrutinized. Unless your app specifically manages Business Managers or ad accounts, you will be rejected. If you only need it to list Instagram accounts, it is likely unnecessary. Drop it and rely on `pages_show_list` and `instagram_basic`.
*   **Permission Justification**: Reviewers will scrutinize *why* you need each permission. Your screencast must explicitly show the exact moment a feature uses a permission (e.g., replying to a comment for `instagram_manage_comments`).
*   **Data Usage Compliance**: Ensure you explicitly state that no data is used for unauthorized ad targeting or sold to third parties.

## 2. Instagram Integration

*   **Connection Flow**: The flow in `Settings.tsx` is generally good. The `showGuide` popup for `META_NO_INSTAGRAM_LINKED` is excellent UX and helps reviewers if they haven't configured their test account correctly.
*   **OAuth Implementation**: You are using the standard Facebook JS SDK (`FB.login`). Ensure your App Dashboard has the correct Web OAuth URIs whitelisted, especially since you are using dual domains (`flazly.com` and `app.flazly.com`).
*   **Webhook Usage**: You are receiving webhooks for messages. Meta reviewers will test this by sending a DM to your test page. If the bot doesn't reply within 20 seconds, or if the webhook fails, the app will be rejected.

## 3. Reviewer Experience

*   **Test Account Clarity**: The reviewer will log in. You **must** provide them with a pre-configured test account that has data populated. Do not make them set up the Brain Base from scratch unless that is the specific feature you are demonstrating for a permission.
*   **Confusing Screens**: The "Impersonation" banner (if a Super Admin is logged in) should NEVER be visible to the reviewer. Ensure the reviewer gets a standard `CLIENT_ADMIN` account.

## 4. UI/UX Review for App Approval

*   **Missing Data Deletion Button (CRITICAL)**: In your `Legal.tsx` (Data Deletion Instructions), Option 1 states: *"Navigate to Settings > Account Management. Under the Danger Zone section, click Delete Account & Purge Data."* **This button does not exist in your `Settings.tsx` page.** A Meta reviewer will read the documentation, try to find the button, fail, and instantly reject the app for non-compliant data deletion instructions.
*   **Hidden Product Catalog**: Good job hiding this before review. Incomplete features are an instant rejection.
*   **Empty States**: Ensure pages like Inbox, Leads, and Broadcasts have beautiful empty states. "No data found" is not acceptable. It should say "No leads yet. Connect your Instagram to start receiving leads!"

## 5. Documentation Review

*   **Privacy Policy & Terms**: The documents in `Legal.tsx` are well-written and cover the necessary GDPR/CCPA bases.
*   **Data Deletion**: As mentioned above, the discrepancy between the documented deletion method and the actual UI is a critical rejection risk.
*   **Impersonation Transparency (HIGH RISK)**: Your Privacy Policy does not explicitly state that Flazly support staff can impersonate user accounts and read their messages. Meta is extremely strict about user privacy. You must add a clause in the Privacy Policy detailing that "Support staff may securely access your workspace for troubleshooting purposes only, with a full audit trail."

## 6. Security & Compliance

*   **Token Storage**: You state tokens are encrypted at rest. Meta requires this. Ensure this is true in your database.
*   **Business Verification**: Since you are requesting advanced access to messaging permissions, your Facebook Business Manager MUST be fully verified (documents uploaded and approved) before you even click "Submit for Review".

## 7. Feature Review

| Feature / Page | Impact on Approval | Status | Recommendation |
| :--- | :--- | :--- | :--- |
| **Settings (FB Login)** | Core requirement | **High Risk** | Remove `business_management` scope from code. Fix missing Data Deletion button. |
| **Automation** | Demonstrates core use case | Safe for Review | Ensure the UI clearly shows how keywords map to replies. |
| **Inbox** | Shows `instagram_manage_messages` | Safe for Review | Must work flawlessly during test. |
| **Knowledge Base** | Optional for Meta | Safe for Review | Pre-fill this for the reviewer so they don't have to upload documents. |
| **Product Catalog** | Irrelevant to Meta API | **Hide Before Review** | (Already hidden). Keep it hidden until approved. |
| **Broadcasts** | High risk of spam | **High Risk** | Reviewers hate spam tools. Frame this strictly as "Responding to users within the 24-hour standard messaging window." |

## 8. Reviewer Test Flow

When submitting, provide these exact steps in the screencast and written instructions:
1. "Log into the application using the provided credentials."
2. "Navigate to Control Center (Settings) and click 'Connect Instagram'."
3. "Complete the Facebook OAuth flow, selecting your test Instagram Professional Account."
4. "Navigate to 'Automation' and verify the 'Hello' trigger is active."
5. "Open your personal Instagram app and send a DM saying 'Hello' to the connected test account."
6. "Observe the automated reply generated by our app, demonstrating the use of `instagram_manage_messages`."
7. "Go to the 'Inbox' tab to view the synchronized message."

## 9. Rejection Risk Analysis

| Risk | Reason | Severity |
| :--- | :--- | :--- |
| **Missing Data Deletion UI** | Documentation says a button exists in Settings, but it is not coded. | **CRITICAL** |
| **Over-permissioning** | Requesting `business_management` without a clear, documented need. | **CRITICAL** |
| **Spam Potential** | The "Broadcasts" feature may look like a tool to bypass the 24-hour rule. | **HIGH** |
| **Incomplete Screencast** | Screencast does not show the exact button click that uses the API. | **HIGH** |
| **Broken Webhooks** | Test account fails to reply during the reviewer's manual test. | **HIGH** |
| **Undocumented Impersonation** | Privacy Policy doesn't mention internal staff accessing DMs. | **MEDIUM** |

## 10. Final Verdict

*   **Approval Readiness Score:** 65/100
*   **Safe To Submit?**: **NO**

### Must Fix Before Submission:
1. **Remove `business_management`**: Remove this from the scope array in `Settings.tsx` (`FB.login`).
2. **Implement Data Deletion Button**: Add the "Danger Zone" and "Delete Account" button to `Settings.tsx` to match your `Legal.tsx` instructions, OR change the instructions to "Email us to delete".
3. **Update Privacy Policy**: Add a clause about the Support Impersonation feature to avoid privacy violations.
4. **Prepare Test Environment**: Create a fully populated test account for the reviewer with active automations.
