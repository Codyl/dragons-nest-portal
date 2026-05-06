# Manual Testing Checklist

This checklist verifies full app behavior in `tanstack-router`, with a focus on high-priority edge cases.

## Test Environment Notes

- Use stable test users for password-based flows and at least one Google-linked account.
- Use one account with password only, one with Google only, and one with MFA enabled.
- Use at least two browsers/devices for cross-device and remembered-device checks.

## Priority Legend

- `P0`: Release blocking. Core auth/security flow.
- `P1`: Important account/security behavior.
- `P2`: Lower-risk UX and content checks.

## Manual Test Cases


| ID        | Priority | Area                       | Test Case                                                                                   | Expected Result                                                                                | Suggested Coverage                                 |
| --------- | -------- | -------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| AUTH-001  | P0       | Verify username            | Enter valid username/email and continue from `/verify-username`.                            | Navigates to `/login`; session + available challenge metadata is stored and login UI appears.  | Cypress E2E + Manual spot-check                    |
| AUTH-002  | P0       | Verify username            | Enter unknown/invalid username.                                                             | Inline error appears, user remains on page, no auth progress.                                  | Cypress component + Manual spot-check              |
| AUTH-003  | P0       | Login                      | Password login with correct credentials.                                                    | User lands on home page (`/`), authenticated nav state is correct after refresh.               | Cypress E2E                                        |
| AUTH-004  | P0       | Login                      | Password login with wrong password.                                                         | Error message shown, no redirect, no auth cookies/session success state.                       | Cypress component + Manual spot-check              |
| AUTH-005  | P0       | Signup                     | Create a new account with valid email + password + confirmation.                            | Redirects to confirm signup flow; no validation errors.                                        | Cypress E2E                                        |
| AUTH-006  | P0       | Confirm signup             | Submit valid 6-digit confirmation code.                                                     | Account confirmation succeeds and user reaches authenticated state/home.                       | Cypress E2E                                        |
| AUTH-007  | P0       | Forgot/reset password      | Request reset code and complete reset with new password.                                    | New password is accepted; old password fails; new password logs in successfully.               | Cypress E2E                                        |
| AUTH-008  | P0       | Session/guards             | Attempt to open `/settings/account` or `/security-settings` while logged out.               | User is redirected to auth flow and cannot access private content.                             | Manual (periodic)                                  |
| AUTH-009  | P1       | Logout                     | Logout from authenticated state.                                                            | Returns to auth flow; protected routes no longer accessible; UI nav reflects logged-out state. | Cypress E2E + Manual spot-check                    |
| AUTH-010  | P1       | Login flow resilience      | Use browser Back/Forward through verify username -> login transitions.                      | No broken route states; user lands on valid pages with consistent form data handling.          | Manual (periodic)                                  |
| SEC-001   | P0       | Change password            | Change password from security settings with valid current + new password.                   | Success feedback shown; new password works on next login.                                      | Cypress E2E                                        |
| SEC-002   | P0       | Delete account             | Delete account from account settings advanced section.                                      | Account is deleted; subsequent login fails for deleted user.                                   | Cypress E2E                                        |
| SEC-003   | P0       | Google SSO login           | Login via Google OAuth with real account.                                                   | OAuth completes, user returns authenticated, correct linked-login state is shown.              | **Manual-only** (not Cypress/Storybook)            |
| SEC-004   | P0       | Google SSO signup          | Create new account using Google OAuth.                                                      | New account created and authenticated; expected profile defaults applied.                      | **Manual-only** (not Cypress/Storybook)            |
| SEC-005   | P0       | Link Google account        | Link Google to existing password account from security settings.                            | Google appears in login methods and can be used for login.                                     | **Manual-only** (real OAuth)                       |
| SEC-006   | P0       | Unlink Google guard        | For Google-only account without password, attempt Remove Google.                            | Remove is blocked and messaging requires setting a password first.                             | Cypress component + Manual spot-check              |
| SEC-007   | P0       | Passkey registration       | Register passkey from security settings on supported device/browser.                        | Passkey registration succeeds and appears usable for subsequent login.                         | **Manual-only** (WebAuthn platform/device)         |
| SEC-008   | P0       | Passkey login              | Sign in using passkey (no password path).                                                   | Successful auth and redirect to home/private routes.                                           | **Manual-only** (WebAuthn platform/device)         |
| SEC-009   | P0       | MFA setup (authenticator)  | Enable authenticator app MFA, scan QR, and verify setup.                                    | MFA is enabled and reflected in security settings.                                             | **Manual-only** (real TOTP app)                    |
| SEC-010   | P0       | MFA login challenge        | Login with MFA-enabled account and submit valid TOTP code.                                  | User is prompted for code and login completes after valid code.                                | **Manual-only** (real TOTP app)                    |
| SEC-011   | P1       | MFA removal                | Remove authenticator MFA and confirm behavior.                                              | MFA prompt no longer appears on next login; settings state updates.                            | Manual (periodic)                                  |
| DEV-001   | P1       | Device listing             | Open security settings device section on password account.                                  | Known devices list renders with name/IP/last-auth details.                                     | Manual (periodic)                                  |
| DEV-002   | P1       | Forget device              | Forget a non-current device and verify list updates.                                        | Device is removed and no longer shown after refresh.                                           | Manual (periodic)                                  |
| DEV-003   | P1       | New device modal           | Login from unrecognized device/browser and evaluate "remember this device" modal behaviors. | Modal appears only when expected; dismiss/confirm behavior follows product rules.              | Cypress component + **Manual-only** E2E validation |
| DEV-004   | P0       | Remembered-device behavior | Mark device as remembered, then re-login and verify challenge behavior changes as intended. | Expected reduced challenge/remembered behavior occurs across sessions/devices.                 | **Manual-only** (Cognito/device state)             |
| ACCT-001  | P1       | User profile update        | Update account fields (e.g., phone number), save, refresh.                                  | Values persist after reload and format/validation behavior is correct.                         | Cypress E2E                                        |
| ACCT-002  | P1       | Validation edge            | Submit invalid profile input (bad phone/email format where applicable).                     | Validation prevents submit and displays clear field/form errors.                               | Cypress component + Manual spot-check              |
| ROUTE-001 | P2       | Public routes              | Visit `/terms-of-service` and `/maintenance` directly.                                      | Pages load with correct content and no auth side effects.                                      | Manual (periodic)                                  |
| ROUTE-002 | P1       | Deep links                 | Open app directly on auth subroutes (`/login`, `/signup`, `/forgot-password`).              | Route initializes correctly and primary form is usable.                                        | Cypress E2E + Manual spot-check                    |
| UX-001    | P2       | Loading states             | Trigger slow-network behavior during auth/profile actions.                                  | Buttons/loading indicators prevent duplicate submits and UI remains stable.                    | Manual (periodic)                                  |
| UX-002    | P1       | Error states               | Simulate backend/network failure during critical operations.                                | User sees actionable error messaging; no stuck/spinner-locked UI states.                       | Manual (periodic)                                  |


## High-Priority Edge Cases (Run Every Release)

- `P0`: Google-only account tries to unlink Google without setting password first.
- `P0`: Password reset succeeds, then old password is rejected and new one is accepted.
- `P0`: Private routes remain protected after logout and hard refresh.
- `P0`: MFA-enabled user can still complete login when challenged with real TOTP.
- `P0`: Passkey registration/login works on at least one supported browser + device combo.
- `P0`: Remembered-device behavior remains correct across a new browser session.

## Manual-Only Reminder List (Cannot Reliably Be Covered By Cypress/Storybook)

Run these on a recurring cadence (at least pre-release and after auth/security changes):

- Google OAuth login/signup/link/unlink flows with real Google consent screens.
- WebAuthn passkey registration and passkey login on real hardware/platform authenticators.
- Real authenticator-app MFA setup and challenge verification using live TOTP codes.
- Cognito remembered-device behavior across multiple devices/sessions.
- Browser password manager/autofill/save-password behavior differences across browsers.

