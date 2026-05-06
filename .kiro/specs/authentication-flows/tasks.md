# Implementation Plan: Authentication Flows

## Overview

These tasks focus on validating, testing, and documenting the existing
authentication flows against the spec. No new application code is created —
tasks cover spec-to-code verification, property-based test coverage, Cypress
component test coverage, and E2E scenario coverage.

## Tasks

- [ ] 1. Validate design against the codebase
  - [ ] 1.1 Verify Auth_Guard (`/(auth)/_auth` `beforeLoad`) matches the spec
    - Confirm redirect-to-`/` for authenticated users on non-exempt routes
    - Confirm `/forgot-password` carve-out is present
    - Confirm `/reset-password` carve-out checks `username` in sessionStorage
    - _Requirements: 11.1, 11.2, 11.3, 11.4_
  - [ ] 1.2 Verify Private_Guard (`/(private)/_private` `beforeLoad`) matches
        the spec
    - Confirm redirect to `/verify-username` with `redirect` search param
    - Confirm authenticated users pass through without redirect
    - _Requirements: 12.1, 12.2_
  - [ ] 1.3 Verify `useVerifyUsername` hook behaviour matches the spec
    - Confirm `POST /auth/verify-username` call signature
    - Confirm sessionStorage writes (`session`, `availableChallenges`,
      `username`) on success
    - Confirm navigation to `/login` on success
    - Confirm error display on failure
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [ ] 1.4 Verify `useLoginMutation` hook — backend-proxied path
    - Confirm `isCognitoAuthConfigured()` branch condition
    - Confirm `POST /auth/initiate-login` payload includes optional
      `deviceKey`/`deviceName`
    - Confirm challenge routing: `SOFTWARE_TOKEN_MFA` → `/mfa/verify-code`,
      `MFA_SETUP` → modal
    - Confirm `NewDeviceMetadata` → localStorage writes
    - Confirm `UserNotConfirmedException` → resend code + navigate to
      `/confirm-signup`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [ ] 1.5 Verify `useLoginMutation` hook — direct Amplify SRP path
    - Confirm `signOut()` is called before `signIn()`
    - Confirm `POST /auth/set-session` is called on `success: true`
    - Confirm `authFlow = 'amplify'` is set in sessionStorage on challenge
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [ ] 1.6 Verify `usePasskeyLogin` hook matches the spec
    - Confirm `username`/`session` read from sessionStorage; error thrown if
      absent
    - Confirm two-step flow: `webAuthnSignInBegin` → `startAuthentication` →
      `webAuthnSignInComplete`
    - Confirm challenge routing on complete response
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_
  - [ ] 1.7 Verify `useGoogleSignin` and `useGoogleSignup` hooks match the spec
    - Confirm `POST /auth/google-token-exchange` and
      `POST /auth/google-sso-signup` calls
    - Confirm `lastLoginProvider` sessionStorage write and `['auth-status']`
      cache invalidation
    - Confirm `window.Cypress` guard on Google SSO button
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3_
  - [ ] 1.8 Verify `SignupFlow` component and `resolveSignupAccountType` match
        the spec
    - Confirm age-gate phase renders first; credentials phase blocked without
      month+year
    - Confirm `resolveSignupAccountType` branch logic (empty → student, <13 →
      adult, <18 → student, ≥18 → adult)
    - Confirm sessionStorage writes on age-gate continue and on credentials
      submit
    - Confirm `POST /auth/confirm-signup` payload fields
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10_
  - [ ] 1.9 Verify forgot-password and reset-password flows match the spec
    - Confirm `POST /auth/forgot-password` call and `username` sessionStorage
      write
    - Confirm `/reset-password` redirect when `username` absent
    - Confirm two-step form: code stored in sessionStorage, then
      `POST /auth/confirm-forgot-password`
    - Confirm `sessionStorage.clear()` and navigation to `/` on success
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  - [ ] 1.10 Verify MFA flow and `useCompleteMFAAuth` hook match the spec
    - Confirm Amplify branch: `confirmSignIn` → `POST /auth/set-session` →
      `clearAmplifyAuthFlow()`
    - Confirm backend branch: `POST /auth/mfa` payload fields
    - Confirm `sessionStorage.clear()` and navigation to `/` on success
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  - [ ] 1.11 Verify account-recovery magic-link flow matches the spec
    - Confirm `POST /auth/account-recovery/consume-magic-link` call with token
    - Confirm "Invalid recovery link" card rendered when token absent
    - Confirm error display and recovery links on API failure
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  - [ ] 1.12 Verify session and device key management matches the spec
    - Confirm `DeviceKey`, `DeviceGroupKey`, `DeviceRandomPassword` localStorage
      writes
    - Confirm `AddedDeviceKey` read and inclusion in login payload
    - Confirm `sessionStorage.clear()` after MFA success
    - Confirm `setAmplifyAuthFlow()` / `clearAmplifyAuthFlow()` usage
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

- [ ] 2. Checkpoint — document any gaps found in tasks 1.1–1.12
  - For each discrepancy between spec and implementation, add a comment in the
    relevant source file or open a tracking note.
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. Property-based tests — pure utility functions
  - [ ] 3.1 Verify or add property test: `resolveSignupAccountType` always
        returns a valid account type
    - Target file: `src/lib/signup-age.test.ts`
    - Use fast-check; generate arbitrary (month 1–12 | '', year | '') pairs
    - Assert result is `'adult'` or `'student'` and never throws
    - **Property 1: resolveSignupAccountType always returns a valid account
      type**
    - **Validates: Requirements 7.7, 7.8, 7.9, 7.10**
  - [ ]\* 3.2 Write property test: under-13 inputs always resolve to 'adult'
    - Target file: `src/lib/signup-age.test.ts`
    - Use fast-check; generate (month, year) pairs where `isUnder13` is true
    - Assert `resolveSignupAccountType` returns `'adult'`
    - **Property 2: Under-13 inputs always resolve to 'adult' (COPPA path)**
    - **Validates: Requirements 7.8**
  - [ ]\* 3.3 Write property test: 13–17 inputs always resolve to 'student'
    - Target file: `src/lib/signup-age.test.ts`
    - Use fast-check; generate (month, year) pairs where `isUnder18` true and
      `isUnder13` false
    - Assert `resolveSignupAccountType` returns `'student'`
    - **Property 3: 13–17 inputs always resolve to 'student'**
    - **Validates: Requirements 7.9**
  - [ ]\* 3.4 Write property test: invalid inputs to `ageFromBirthMonthYear`
    return NaN
    - Target file: `src/lib/signup-age.test.ts`
    - Use fast-check; generate month values outside 1–12 and non-finite numbers
    - Assert return value is `NaN`
    - **Property 4: Invalid inputs to ageFromBirthMonthYear return NaN**
    - **Validates: Requirements 15.1, 15.2**
  - [ ]\* 3.5 Write property test: valid inputs to `ageFromBirthMonthYear`
    return a non-negative integer
    - Target file: `src/lib/signup-age.test.ts`
    - Use fast-check; generate valid (month 1–12, past year) pairs
    - Assert return value is a non-negative integer
    - **Property 5: Valid inputs to ageFromBirthMonthYear return a non-negative
      integer**
    - **Validates: Requirements 15.4**
  - [ ]\* 3.6 Write property test: `signupPasswordFieldSchema` accepts exactly
    strings satisfying all five rules
    - Target file: `src/lib/signup-age.test.ts` or a co-located schema test file
    - Use fast-check; generate arbitrary strings and independently compute
      expected validity
    - Assert `safeParse(s).success` matches the five-rule predicate
    - **Property 6: signupPasswordFieldSchema accepts exactly the strings
      satisfying all five rules**
    - **Validates: Requirements 14.1, 14.2, 14.3, 14.4, 14.5, 14.6**

- [ ] 4. Checkpoint — run existing unit/property tests
  - Run `src/lib/signup-age.test.ts` and confirm all tests pass.
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Cypress component tests — auth form coverage
  - [ ] 5.1 Review `src/components/forms/verify-username.cy.tsx`
    - Confirm it covers: submit with valid input, error display, navigation to
      `/login`
    - Note any missing scenarios against Requirements 1.1–1.4
  - [ ] 5.2 Review `src/components/forms/login.cy.tsx`
    - Confirm it covers: password submit (backend path), MFA challenge routing,
      passkey button visibility
    - Note any missing scenarios against Requirements 2, 3, 4
  - [ ] 5.3 Review `src/components/forms/signup-flow.cy.tsx`
    - Confirm it covers: age-gate phase, credentials phase, account type
      resolution, COPPA path
    - Note any missing scenarios against Requirements 7.1–7.10
  - [ ] 5.4 Review `src/components/forms/confirm-signup.cy.tsx`
    - Confirm it covers: 6-digit code submit, success navigation
    - Note any missing scenarios against Requirements 7.5, 7.6
  - [ ] 5.5 Review `src/components/forms/forgot-password.cy.tsx` and
        `reset-password.cy.tsx`
    - Confirm they cover: submit, sessionStorage writes, two-step form, success
      navigation
    - Note any missing scenarios against Requirements 8.1–8.5
  - [ ] 5.6 Review `src/components/forms/mfa.cy.tsx`
    - Confirm it covers: 6-digit input, Amplify path, backend path, error
      display
    - Note any missing scenarios against Requirements 9.1–9.5
  - [ ]\* 5.7 Add missing Cypress component test cases identified in 5.1–5.6
    - Add only the specific `it()` blocks that are absent; do not rewrite
      existing tests

- [ ] 6. E2E test coverage — P0 scenarios
  - [ ] 6.1 Review `cypress/e2e/` for verify-username → login → home happy path
    - Confirm the full flow is covered end-to-end
    - _Requirements: 1.1, 1.2, 2.1, 2.4_
  - [ ] 6.2 Review `cypress/e2e/` for auth guard redirect (authenticated →
        `/login` → `/`)
    - Confirm authenticated user visiting an auth route is redirected to `/`
    - _Requirements: 11.1_
  - [ ] 6.3 Review `cypress/e2e/` for private guard redirect (unauthenticated →
        private route → `/verify-username`)
    - Confirm unauthenticated user is redirected with `redirect` search param
    - _Requirements: 12.1_
  - [ ] 6.4 Review `cypress/e2e/` for forgot-password → reset-password flow
    - Confirm two-step form and success navigation are covered
    - _Requirements: 8.1–8.5_
  - [ ] 6.5 Review `cypress/e2e/` for signup → confirm-signup flow
    - Confirm age-gate, credentials, confirmation code, and redirect to home are
      covered
    - _Requirements: 7.1–7.6_
  - [ ]\* 6.6 Add missing E2E test cases identified in 6.1–6.5
    - Add only the specific `it()` blocks that are absent; do not rewrite
      existing tests

- [ ] 7. Final checkpoint — full test suite
  - Run all unit, component, and E2E tests and confirm they pass.
  - Document any remaining gaps between the spec and the implementation as
    inline comments or a brief gap summary.
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster review pass
- All tasks reference specific requirements for traceability
- No new application routes, hooks, or components should be created as part of
  this plan
- Property tests use fast-check (already referenced in the design's testing
  strategy)
- Checkpoints ensure incremental validation at natural break points
