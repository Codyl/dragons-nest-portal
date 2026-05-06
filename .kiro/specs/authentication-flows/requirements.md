# Requirements Document

## Introduction

The authentication-flows feature implements the complete set of identity and
access management flows for the application. It covers credential-based login
(password + MFA), passwordless login (passkeys/WebAuthn), social login (Google
OAuth), account creation with an age gate and email verification, password
reset, and account recovery via magic link. All flows are built on AWS Cognito
as the identity provider, with the React frontend communicating through a NestJS
backend that owns the HttpOnly session cookies. Auth state is managed via
TanStack Query (`['auth-status']` query key), and TanStack Router `beforeLoad`
guards enforce access control on both auth and private route groups.

---

## Glossary

- **Auth_Layout**: The `/(auth)/_auth` TanStack Router layout route that wraps
  all authentication pages and enforces the authenticated-user redirect guard.
- **Private_Layout**: The `/(private)/_private` TanStack Router layout route
  that wraps all protected pages and enforces the unauthenticated-user redirect
  guard.
- **Auth_Guard**: The `beforeLoad` hook on `Auth_Layout` that redirects
  authenticated users away from auth pages.
- **Private_Guard**: The `beforeLoad` hook on `Private_Layout` that redirects
  unauthenticated users to `/verify-username`.
- **useAuth**: The React hook that queries `['auth-status']` via
  `UserServices.getUser()` and exposes `isAuthenticated`, `isLoading`, and
  `checkAuth()`.
- **useVerifyUsername**: The React mutation hook that calls
  `POST /auth/verify-username`.
- **useLoginMutation**: The React mutation hook that handles password login via
  either the Amplify SRP path or the backend-proxied path.
- **usePasskeyLogin**: The React mutation hook that orchestrates the two-step
  WebAuthn sign-in (begin → complete).
- **useCompleteMFAAuth**: The React mutation hook that completes a TOTP MFA
  challenge via either the Amplify or backend path.
- **useGoogleSignin**: The React mutation hook that calls
  `POST /auth/google-token-exchange`.
- **useGoogleSignup**: The React mutation hook that calls
  `POST /auth/google-sso-signup`.
- **SignupFlow**: The multi-phase signup component that manages the age-gate →
  credentials transition.
- **resolveSignupAccountType**: The pure function that maps a (month, year)
  birth date to `'adult'` or `'student'`.
- **ageFromBirthMonthYear**: The pure function that computes completed years of
  age from a birth month (1–12) and year, using the last day of the birth month.
- **signupPasswordFieldSchema**: The Zod schema that validates signup passwords
  against the five-rule policy.
- **Amplify_Path**: The direct SRP sign-in path using `aws-amplify` when
  `VITE_COGNITO_USER_POOL_ID` and `VITE_COGNITO_CLIENT_ID` are set.
- **Backend_Path**: The backend-proxied sign-in path that forwards credentials
  to `POST /auth/initiate-login`.
- **sessionStorage**: Browser tab-scoped storage used for transient auth state
  (session tokens, username, challenge data).
- **localStorage**: Browser persistent storage used for Cognito device tracking
  keys.
- **HttpOnly_Cookie**: A server-set cookie inaccessible to JavaScript, used to
  store Cognito tokens after `POST /auth/set-session`.
- **COPPA**: Children's Online Privacy Protection Act; requires parental consent
  for users under 13.
- **TOTP**: Time-based One-Time Password; the MFA method supported by the
  application.
- **WebAuthn**: Web Authentication API standard used for passkey-based login.
- **DeviceKey**: Cognito device tracking key stored in localStorage under the
  key `DeviceKey`.
- **DeviceGroupKey**: Cognito device group key stored in localStorage under the
  key `DeviceGroupKey`.
- **DeviceRandomPassword**: Cognito device random password stored in
  localStorage under the key `DeviceRandomPassword`.
- **AddedDeviceKey**: Previously confirmed device key stored in localStorage
  under the key `AddedDeviceKey` and sent on subsequent logins.

---

## Requirements

### Requirement 1: Verify Username Flow

**User Story:** As a user, I want to enter my email or username to identify
myself, so that the system can determine which authentication methods are
available to me.

#### Acceptance Criteria

1. WHEN a user submits a non-empty email or username on `/verify-username`, THE
   useVerifyUsername hook SHALL call `POST /auth/verify-username` with the
   submitted value.
2. WHEN `POST /auth/verify-username` succeeds, THE system SHALL store `session`,
   `availableChallenges` (comma-separated), and `username` in sessionStorage,
   then navigate to `/login`.
3. WHEN `/login` mounts and `availableChallenges` is absent or empty in
   sessionStorage, THE system SHALL navigate to `/verify-username`.
4. IF `POST /auth/verify-username` returns an error, THEN THE system SHALL
   display the error message on the `/verify-username` page.

---

### Requirement 2: Password Login — Backend-Proxied Path

**User Story:** As a user, I want to sign in with my password via the backend,
so that my credentials are validated by the server without requiring direct
Cognito SDK configuration in the browser.

#### Acceptance Criteria

1. WHILE `isCognitoAuthConfigured()` returns false, WHEN a user submits a
   password on `/login`, THE useLoginMutation hook SHALL call
   `POST /auth/initiate-login` with `username`, `password`, `session`, and
   optionally `deviceKey` and `deviceName`.
2. WHEN `POST /auth/initiate-login` returns `ChallengeName: SOFTWARE_TOKEN_MFA`,
   THE system SHALL store the new `session` in sessionStorage and navigate to
   `/mfa/verify-code`.
3. WHEN `POST /auth/initiate-login` returns `ChallengeName: MFA_SETUP`, THE
   system SHALL open the `MFAAuthenticatorQRCodeModal`.
4. WHEN `POST /auth/initiate-login` returns no `ChallengeName` and an
   `AuthenticationResult`, THE system SHALL store `DeviceKey` and
   `DeviceGroupKey` from `NewDeviceMetadata` in localStorage (if present), store
   `DeviceRandomPassword` in localStorage (if present), and navigate to `/`.
5. IF `POST /auth/initiate-login` returns a `UserNotConfirmedException` error,
   THEN THE system SHALL call `POST /auth/confirm-signup/resend-code`, clear the
   `session` from sessionStorage, and navigate to `/confirm-signup`.

---

### Requirement 3: Password Login — Direct Amplify SRP Path

**User Story:** As a user, I want to sign in using the Amplify SRP protocol
directly in the browser, so that my password never leaves the browser and is
used only for the cryptographic handshake.

#### Acceptance Criteria

1. WHILE `isCognitoAuthConfigured()` returns true, WHEN a user submits a
   password on `/login`, THE useLoginMutation hook SHALL call
   `signInWithCognito(username, password)` which first calls `signOut()` to
   clear any stale Amplify session, then calls `signIn()`.
2. WHEN `signInWithCognito` returns `success: true`, THE system SHALL call
   `POST /auth/set-session` with the retrieved tokens to establish HttpOnly
   cookies, then navigate to `/`.
3. WHEN `signInWithCognito` returns a challenge, THE system SHALL set
   `authFlow = 'amplify'` in sessionStorage and route based on the
   `challengeName` (e.g., `SOFTWARE_TOKEN_MFA` → `/mfa/verify-code`, `MFA_SETUP`
   → open modal).
4. IF `signInWithCognito` returns `success: false` with an error, THEN THE
   system SHALL surface the error to the mutation error state.

---

### Requirement 4: Passkey (WebAuthn) Login Flow

**User Story:** As a user, I want to sign in with a passkey, so that I can
authenticate without entering a password.

#### Acceptance Criteria

1. WHEN `WEB_AUTHN` is present in `availableChallenges` in sessionStorage, THE
   `/login` route SHALL render a "Sign in with Passkey" button.
2. WHEN a user clicks "Sign in with Passkey", THE usePasskeyLogin hook SHALL
   read `username` and `session` from sessionStorage and call
   `POST /auth/webauthn/sign-in/begin`.
3. IF `username` or `session` is absent from sessionStorage when passkey login
   is triggered, THEN THE system SHALL throw an error with the message
   `'Missing sign-in session. Go back and verify your email again.'`
4. WHEN `POST /auth/webauthn/sign-in/begin` returns `authenticationResult`
   (immediate success), THE system SHALL navigate to `/`.
5. WHEN `POST /auth/webauthn/sign-in/begin` returns `challengeParameters`, THE
   system SHALL call `startAuthentication` from `@simplewebauthn/browser` with
   the parsed options, then call `POST /auth/webauthn/sign-in/complete` with
   `username`, `session`, `credential`, and `deviceName`.
6. WHEN `POST /auth/webauthn/sign-in/complete` returns
   `challengeName: SOFTWARE_TOKEN_MFA`, THE system SHALL update `session` in
   sessionStorage and navigate to `/mfa/verify-code`.
7. WHEN `POST /auth/webauthn/sign-in/complete` returns
   `challengeName: MFA_SETUP`, THE system SHALL invoke the `onMfaSetupRequired`
   callback.
8. WHEN `POST /auth/webauthn/sign-in/complete` returns no `challengeName`, THE
   system SHALL navigate to `/`.

---

### Requirement 5: Google SSO Sign-In

**User Story:** As a user, I want to sign in with my Google account, so that I
can authenticate without a password.

#### Acceptance Criteria

1. WHEN a user clicks the Google sign-in button on `/verify-username`, THE
   system SHALL initiate the Google OAuth flow via the `@react-oauth/google`
   `GoogleLogin` component.
2. WHEN the Google OAuth flow returns a credential JWT, THE useGoogleSignin hook
   SHALL call `POST /auth/google-token-exchange` with the credential.
3. WHEN `POST /auth/google-token-exchange` succeeds, THE system SHALL store
   `lastLoginProvider` in sessionStorage, invalidate the `['auth-status']`
   TanStack Query cache, and navigate to `/`.
4. THE Google sign-in button SHALL NOT render when `window.Cypress` is defined
   (Cypress test environment guard).

---

### Requirement 6: Google SSO Sign-Up

**User Story:** As a new user, I want to create an account using my Google
account, so that I can register without setting a password.

#### Acceptance Criteria

1. WHEN a user clicks the Google sign-up button on `/signup`, THE system SHALL
   initiate the Google OAuth flow via the `@react-oauth/google` `GoogleLogin`
   component.
2. WHEN the Google OAuth flow returns a credential JWT, THE useGoogleSignup hook
   SHALL call `POST /auth/google-sso-signup` with the credential.
3. WHEN `POST /auth/google-sso-signup` succeeds, THE system SHALL navigate to
   `/`.

---

### Requirement 7: Signup with Age Gate and Email Confirmation

**User Story:** As a new user, I want to create an account by providing my birth
date and credentials, so that the system can apply the correct account type and
COPPA rules.

#### Acceptance Criteria

1. WHEN a user visits `/signup`, THE SignupFlow component SHALL render the
   age-gate phase first, prompting for birth month and year.
2. WHEN a user selects a birth month and year and clicks continue, THE system
   SHALL compute the account type using `resolveSignupAccountType(month, year)`,
   store `birthMonth` and `birthYear` in sessionStorage, and advance to the
   credentials phase.
3. IF the continue button is clicked with month or year absent, THEN THE system
   SHALL not advance to the credentials phase.
4. WHEN a user submits email and password on the credentials phase, THE system
   SHALL call `POST /auth/initiate-signup` with `email` and `password`, store
   `username`, `session`, and `password` in sessionStorage, and navigate to
   `/confirm-signup`.
5. WHEN a user submits a 6-digit confirmation code on `/confirm-signup`, THE
   system SHALL call `POST /auth/confirm-signup` with `username`, `code`,
   `session`, `password`, `accountType`, and optionally `givenName`,
   `familyName`, and `coppaConsent` (read from sessionStorage).
6. WHEN `POST /auth/confirm-signup` succeeds with an `AuthenticationResult`, THE
   system SHALL navigate to `/`.
7. WHEN `resolveSignupAccountType` is called with `month === ''` or
   `year === ''`, THE SignupFlow component SHALL treat the account type as
   `'student'` (default).
8. WHEN `resolveSignupAccountType` is called with a birth date where `isUnder13`
   is true, THE system SHALL set account type to `'adult'` and require COPPA
   consent during confirm-signup.
9. WHEN `resolveSignupAccountType` is called with a birth date where `isUnder18`
   is true and `isUnder13` is false, THE system SHALL set account type to
   `'student'`.
10. WHEN `resolveSignupAccountType` is called with a birth date where age is 18
    or older, THE system SHALL set account type to `'adult'`.

---

### Requirement 8: Forgot Password and Reset Password

**User Story:** As a user who has forgotten their password, I want to receive a
reset code by email and set a new password, so that I can regain access to my
account.

#### Acceptance Criteria

1. WHEN a user submits their email on `/forgot-password`, THE system SHALL call
   `POST /auth/forgot-password` with the username, store `username` in
   sessionStorage, and navigate to `/reset-password`.
2. WHEN `/reset-password` mounts and `username` is absent from sessionStorage,
   THE system SHALL render a redirect to `/forgot-password`.
3. WHEN a user submits a valid 6-digit reset code on step 1 of
   `/reset-password`, THE system SHALL store the code in sessionStorage and
   advance to step 2.
4. WHEN a user submits a new password on step 2 of `/reset-password`, THE system
   SHALL call `POST /auth/confirm-forgot-password` with `username`, `code`, and
   `password`.
5. WHEN `POST /auth/confirm-forgot-password` succeeds, THE system SHALL clear
   sessionStorage and navigate to `/`.
6. WHEN an authenticated user navigates to `/forgot-password`, THE Auth_Guard
   SHALL allow access without redirecting to `/`.

---

### Requirement 9: MFA (TOTP) Challenge

**User Story:** As a user with TOTP MFA enabled, I want to complete a 6-digit
code challenge after entering my password, so that my account is protected by a
second factor.

#### Acceptance Criteria

1. WHEN a user arrives at `/mfa/verify-code`, THE MFAForm component SHALL render
   a 6-digit code input field.
2. WHEN a user submits a 6-digit TOTP code and `isAmplifyAuthFlow()` returns
   true, THE useCompleteMFAAuth hook SHALL call `confirmSignIn` via the Amplify
   SDK, then call `POST /auth/set-session` with the retrieved tokens, then call
   `clearAmplifyAuthFlow()`.
3. WHEN a user submits a 6-digit TOTP code and `isAmplifyAuthFlow()` returns
   false, THE useCompleteMFAAuth hook SHALL call `POST /auth/mfa` with
   `username`, `password`, `softwareTokenMfaCode`, `session`, and
   `challengeName`.
4. WHEN MFA verification succeeds and an `AuthenticationResult` is returned, THE
   system SHALL clear sessionStorage and navigate to `/`.
5. IF MFA verification fails, THEN THE system SHALL display the error message on
   the `/mfa/verify-code` page.

---

### Requirement 10: Account Recovery via Magic Link

**User Story:** As a user who cannot sign in due to lost TOTP or email access, I
want to receive a one-time magic link from support, so that I can regain access
to my account.

#### Acceptance Criteria

1. WHEN a user visits `/account-recovery`, THE system SHALL display support
   contact information (email and phone) and an account recovery form.
2. WHEN a user visits `/account-recovery/magic-link` with a `token` query
   parameter, THE system SHALL call
   `POST /auth/account-recovery/consume-magic-link` with the token.
3. WHEN `POST /auth/account-recovery/consume-magic-link` succeeds, THE system
   SHALL navigate to `/`.
4. WHEN a user visits `/account-recovery/magic-link` without a `token` query
   parameter, THE system SHALL render an "Invalid recovery link" card with a
   link back to `/account-recovery`.
5. IF `POST /auth/account-recovery/consume-magic-link` returns an error, THEN
   THE system SHALL display the error message and provide links to request
   another recovery link and to create a new account.

---

### Requirement 11: Auth Route Guard (Authenticated Users)

**User Story:** As an authenticated user, I want to be redirected away from auth
pages automatically, so that I am not shown sign-in forms I do not need.

#### Acceptance Criteria

1. WHEN an authenticated user navigates to any route under `/(auth)/_auth`
   (except the carve-outs below), THE Auth_Guard SHALL redirect to `/`.
2. WHEN an authenticated user navigates to `/forgot-password`, THE Auth_Guard
   SHALL allow access without redirecting.
3. WHEN an authenticated user navigates to `/reset-password` and `username` is
   present in sessionStorage, THE Auth_Guard SHALL allow access without
   redirecting.
4. WHEN an authenticated user navigates to `/reset-password` and `username` is
   absent from sessionStorage, THE Auth_Guard SHALL redirect to `/`.

---

### Requirement 12: Private Route Guard (Unauthenticated Users)

**User Story:** As an unauthenticated user, I want to be redirected to the
sign-in page when I try to access a private page, so that protected content is
not accessible without authentication.

#### Acceptance Criteria

1. WHEN an unauthenticated user navigates to any route under
   `/(private)/_private`, THE Private_Guard SHALL redirect to `/verify-username`
   with the original path included as a `redirect` search parameter.
2. WHEN an authenticated user navigates to any route under
   `/(private)/_private`, THE Private_Guard SHALL allow access and render the
   private layout.

---

### Requirement 13: Session and Device Key Management

**User Story:** As a returning user, I want my device to be remembered by
Cognito, so that I can benefit from device-aware MFA flows on subsequent logins.

#### Acceptance Criteria

1. WHEN a successful password login response includes `NewDeviceMetadata`, THE
   system SHALL store `DeviceKey` and `DeviceGroupKey` in localStorage.
2. WHEN a successful password login response includes `DeviceRandomPassword`,
   THE system SHALL store `DeviceRandomPassword` in localStorage.
3. WHEN a login request is initiated and `AddedDeviceKey` is present in
   localStorage, THE system SHALL include `deviceKey` in the login payload sent
   to `POST /auth/initiate-login`.
4. WHEN MFA verification succeeds, THE system SHALL call
   `sessionStorage.clear()` to remove all transient auth state.
5. WHEN the Amplify SRP path is used and a challenge is returned, THE system
   SHALL set `authFlow = 'amplify'` in sessionStorage via
   `setAmplifyAuthFlow()`.
6. WHEN the Amplify MFA path completes successfully, THE system SHALL call
   `clearAmplifyAuthFlow()` to remove the `authFlow` key from sessionStorage.

---

### Requirement 14: Password Validation Schema

**User Story:** As a new user, I want clear password requirements enforced at
signup, so that my account is protected by a strong password.

#### Acceptance Criteria

1. THE signupPasswordFieldSchema SHALL reject any string shorter than 8
   characters.
2. THE signupPasswordFieldSchema SHALL reject any string that does not contain
   at least one uppercase letter (A–Z).
3. THE signupPasswordFieldSchema SHALL reject any string that does not contain
   at least one lowercase letter (a–z).
4. THE signupPasswordFieldSchema SHALL reject any string that does not contain
   at least one digit (0–9).
5. THE signupPasswordFieldSchema SHALL reject any string that does not contain
   at least one special character from the set `!@#$%^&*`.
6. WHEN a string satisfies all five rules, THE signupPasswordFieldSchema SHALL
   return a successful parse result.

---

### Requirement 15: Age Calculation Utility

**User Story:** As the system, I want to compute a user's age from their birth
month and year using a conservative bias, so that users near an age boundary are
correctly classified as younger rather than older.

#### Acceptance Criteria

1. WHEN `ageFromBirthMonthYear` is called with a `month1to12` value outside the
   range 1–12, THE function SHALL return `NaN`.
2. WHEN `ageFromBirthMonthYear` is called with a non-finite `month1to12` or
   `year`, THE function SHALL return `NaN`.
3. WHEN `ageFromBirthMonthYear` is called with valid inputs, THE function SHALL
   use the last day of the birth month as the birth date (conservative bias
   toward younger age).
4. WHEN `ageFromBirthMonthYear` is called with valid inputs representing a past
   date, THE function SHALL return a non-negative integer representing completed
   years of age.
