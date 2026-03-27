/**
 * SessionStorage key set in `cypress/support/e2e.ts` on `window:before:load`.
 * Component tests use `component.tsx` only, so they never set this and can still mount the modal.
 */
export const CYPRESS_E2E_SUPPRESS_NEW_DEVICE_MODAL_SESSION_KEY =
  '__cypress_e2e_suppress_new_device_modal__';
