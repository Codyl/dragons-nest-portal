# E2E tests

- **`*.cy.ts`** — Run against **Storybook** (port 6006). Use `pnpm storybook` then `pnpm cypress:run:e2e`. These specs use `visitStorybook` and load stories; MSW is active in Storybook.
- **`*.e2e.ts`** — Run against the **Vite app** (port 5173). Use `pnpm dev` then `pnpm cypress:run:e2e:app`. Colocated `.e2e.ts` files live next to routes in `src/routes/`; whole-flow specs live here in `cypress/e2e/`.

## Auth flows not covered by Cypress E2E

**MFA (multi-factor authentication)** and **Google SSO** are intentionally **not** tested in Cypress E2E:

- **MFA**: Requires a second factor (OTP from an app, SMS, or email). In E2E we cannot reliably simulate TOTP codes, SMS delivery, or email links in a deterministic way. MFA flows are better covered by unit/component tests with mocked APIs and by manual or dedicated security testing.
- **Google SSO**: Uses the Google OAuth consent screen in a popup/redirect. Automated browsers cannot complete real OAuth consent (login to Google, grant permissions) without real credentials and human interaction. Google also restricts automated access. SSO is typically tested manually or with a test identity provider in a staging environment.

The auth flow specs in `auth-flow.e2e.ts` cover only **password-based** auth: verify username → login, signup → confirm signup, and forgot password → reset code → new password.
