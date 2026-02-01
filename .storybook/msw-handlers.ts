import { http, HttpResponse, delay } from 'msw';

/** Match by pathname so we intercept regardless of base URL (VITE_API_URL / origin) */
const pathMatch = (pathname: string) => ({ request }: { request: Request }) =>
  new URL(request.url).pathname === pathname;

const matchChangePassword = pathMatch('/users/me/change-password');
const matchDeleteUser = pathMatch('/users/me');
const matchUsersMe = pathMatch('/users/me');
const matchUsersMeAccount = pathMatch('/users/me/account');
const matchAuthVerifyUsername = pathMatch('/auth/verify-username');
const matchAuthInitiateLogin = pathMatch('/auth/initiate-login');
const matchAuthForgotPassword = pathMatch('/auth/forgot-password');
const matchAuthConfirmForgotPassword = pathMatch('/auth/confirm-forgot-password');
const matchAuthInitiateSignup = pathMatch('/auth/initiate-signup');
const matchAuthConfirmSignup = pathMatch('/auth/confirm-signup');
const matchAuthResendCode = pathMatch('/auth/confirm-signup/resend-code');
const matchAuthMfa = pathMatch('/auth/mfa');
const matchAuthAnswerOtp = pathMatch('/auth/answer-otp');
const matchAuthMfaGenerateSecret = pathMatch('/auth/mfa/generate-authenticator-secret');
const matchAuthMfaConnect = pathMatch('/auth/mfa/connect-authenticator-app');
const matchAuthRefreshToken = pathMatch('/auth/refresh-token');

// Default auth success response (tokens sent as HttpOnly cookies by backend; frontend receives minimal success payload)
const authSuccess = {
  data: {
    Session: 'test-session',
    ChallengeName: null,
    AuthenticationResult: {},
  },
};

const verifyUsernameSuccess = {
  data: {
    Session: 'test-session',
    AvailableChallenges: ['PASSWORD_VERIFIER'],
  },
};

export const handlers = [
  // Change password
  http.post(matchChangePassword, async () => {
    await delay(500);
    return HttpResponse.json({ message: 'Password changed successfully' }, { status: 200 });
  }),
  // Delete user
  http.delete(matchDeleteUser, async () => {
    return HttpResponse.json({ message: 'User deleted' }, { status: 200 });
  }),
  // Get user (users/me)
  http.get(matchUsersMe, async () => {
    return HttpResponse.json({
      data: {
        email: 'test@example.com',
        given_name: 'John',
        family_name: 'Doe',
        middle_name: '',
        phone_number: '+12025550123',
      },
    }, { status: 200 });
  }),
  // Update user (users/me/account)
  http.put(matchUsersMeAccount, async () => {
    return HttpResponse.json({ message: 'Updated' }, { status: 200 });
  }),
  // Auth: verify username
  http.post(matchAuthVerifyUsername, async () => {
    return HttpResponse.json(verifyUsernameSuccess, { status: 200 });
  }),
  // Auth: initiate login
  http.post(matchAuthInitiateLogin, async () => {
    return HttpResponse.json({ ...authSuccess, data: { ...authSuccess.data, ChallengeName: null } }, { status: 200 });
  }),
  // Auth: forgot password
  http.post(matchAuthForgotPassword, async () => {
    return HttpResponse.json({ message: 'OK', data: {} }, { status: 200 });
  }),
  // Auth: confirm forgot password
  http.post(matchAuthConfirmForgotPassword, async () => {
    return HttpResponse.json(authSuccess, { status: 200 });
  }),
  // Auth: initiate signup
  http.post(matchAuthInitiateSignup, async () => {
    return HttpResponse.json({ data: { Session: 'test-session' } }, { status: 200 });
  }),
  // Auth: confirm signup
  http.post(matchAuthConfirmSignup, async () => {
    return HttpResponse.json(authSuccess, { status: 200 });
  }),
  // Auth: resend confirmation code
  http.post(matchAuthResendCode, async () => {
    return HttpResponse.json({ message: 'OK' }, { status: 200 });
  }),
  // Auth: MFA
  http.post(matchAuthMfa, async () => {
    return HttpResponse.json(authSuccess, { status: 200 });
  }),
  // Auth: answer OTP
  http.post(matchAuthAnswerOtp, async () => {
    return HttpResponse.json(authSuccess, { status: 200 });
  }),
  // Auth: generate authenticator secret
  http.post(matchAuthMfaGenerateSecret, async () => {
    return HttpResponse.json({
      data: { Session: 'new-session', qrString: 'otpauth://totp/Test?secret=JBSWY3DPEHPK3PXP' },
    }, { status: 200 });
  }),
  // Auth: connect authenticator app
  http.post(matchAuthMfaConnect, async () => {
    return HttpResponse.json(authSuccess, { status: 200 });
  }),
  // Auth: refresh token (tokens sent as HttpOnly cookies; mock returns success)
  http.post(matchAuthRefreshToken, async () => {
    return HttpResponse.json({ message: 'Token refreshed successfully', data: {} }, { status: 200 });
  }),
];

/** Replace handler at index with variant for story-specific behavior */
const replaceHandler = (index: number, variant: (typeof handlers)[number]) =>
  [...handlers.slice(0, index), variant, ...handlers.slice(index + 1)];

// Handlers for other APIs (used with change-password variants)
const otherHandlers = handlers.slice(1);

// Change password story variants (index 0)
const changePasswordSuccess = http.post(matchChangePassword, async () => {
  return HttpResponse.json({ message: 'Password changed successfully' }, { status: 200 });
});
const changePasswordError = http.post(matchChangePassword, async () => {
  return HttpResponse.json({ message: 'Password change failed' }, { status: 400 });
});
const changePasswordLoading = http.post(matchChangePassword, async () => {
  await delay(2000);
  return HttpResponse.json({ message: 'Password changed successfully' }, { status: 200 });
});
const changePasswordNetworkError = http.post(matchChangePassword, async () => {
  return HttpResponse.error();
});

export const successHandlers = [...otherHandlers, changePasswordSuccess];
export const errorHandlers = [...otherHandlers, changePasswordError];
export const loadingHandlers = [...otherHandlers, changePasswordLoading];
export const networkErrorHandlers = [...otherHandlers, changePasswordNetworkError];

// Confirm signup (index 9)
const confirmSignupSuccess = http.post(matchAuthConfirmSignup, async () => HttpResponse.json(authSuccess, { status: 200 }));
const confirmSignupError = http.post(matchAuthConfirmSignup, async () => HttpResponse.json({ message: 'Invalid code' }, { status: 400 }));
const confirmSignupLoading = http.post(matchAuthConfirmSignup, async () => { await delay(2000); return HttpResponse.json(authSuccess, { status: 200 }); });
const confirmSignupNetworkError = http.post(matchAuthConfirmSignup, () => HttpResponse.error());
export const confirmSignupSuccessHandlers = replaceHandler(9, confirmSignupSuccess);
export const confirmSignupErrorHandlers = replaceHandler(9, confirmSignupError);
export const confirmSignupLoadingHandlers = replaceHandler(9, confirmSignupLoading);
export const confirmSignupNetworkErrorHandlers = replaceHandler(9, confirmSignupNetworkError);

// Forgot password (index 6)
const forgotPasswordSuccess = http.post(matchAuthForgotPassword, async () => HttpResponse.json({ message: 'OK', data: {} }, { status: 200 }));
const forgotPasswordError = http.post(matchAuthForgotPassword, async () => HttpResponse.json({ message: 'User not found' }, { status: 400 }));
const forgotPasswordLoading = http.post(matchAuthForgotPassword, async () => { await delay(2000); return HttpResponse.json({ message: 'OK', data: {} }, { status: 200 }); });
const forgotPasswordNetworkError = http.post(matchAuthForgotPassword, () => HttpResponse.error());
export const forgotPasswordSuccessHandlers = replaceHandler(6, forgotPasswordSuccess);
export const forgotPasswordErrorHandlers = replaceHandler(6, forgotPasswordError);
export const forgotPasswordLoadingHandlers = replaceHandler(6, forgotPasswordLoading);
export const forgotPasswordNetworkErrorHandlers = replaceHandler(6, forgotPasswordNetworkError);

// Create account / initiate signup (index 8)
const initiateSignupSuccess = http.post(matchAuthInitiateSignup, async () => HttpResponse.json({ data: { Session: 'test-session' } }, { status: 200 }));
const initiateSignupError = http.post(matchAuthInitiateSignup, async () => HttpResponse.json({ message: 'Email already exists' }, { status: 400 }));
const initiateSignupLoading = http.post(matchAuthInitiateSignup, async () => { await delay(2000); return HttpResponse.json({ data: { Session: 'test-session' } }, { status: 200 }); });
const initiateSignupNetworkError = http.post(matchAuthInitiateSignup, () => HttpResponse.error());
export const initiateSignupSuccessHandlers = replaceHandler(8, initiateSignupSuccess);
export const initiateSignupErrorHandlers = replaceHandler(8, initiateSignupError);
export const initiateSignupLoadingHandlers = replaceHandler(8, initiateSignupLoading);
export const initiateSignupNetworkErrorHandlers = replaceHandler(8, initiateSignupNetworkError);

// Login (index 5)
const loginSuccess = http.post(matchAuthInitiateLogin, async () => HttpResponse.json({ ...authSuccess, data: { ...authSuccess.data, ChallengeName: null } }, { status: 200 }));
const loginError = http.post(matchAuthInitiateLogin, async () => HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 }));
const loginLoading = http.post(matchAuthInitiateLogin, async () => { await delay(2000); return HttpResponse.json({ ...authSuccess, data: { ...authSuccess.data, ChallengeName: null } }, { status: 200 }); });
const loginNetworkError = http.post(matchAuthInitiateLogin, () => HttpResponse.error());
export const loginSuccessHandlers = replaceHandler(5, loginSuccess);
export const loginErrorHandlers = replaceHandler(5, loginError);
export const loginLoadingHandlers = replaceHandler(5, loginLoading);
export const loginNetworkErrorHandlers = replaceHandler(5, loginNetworkError);

// Reset password / confirm forgot password (index 7)
const confirmForgotPasswordSuccess = http.post(matchAuthConfirmForgotPassword, async () => HttpResponse.json(authSuccess, { status: 200 }));
const confirmForgotPasswordError = http.post(matchAuthConfirmForgotPassword, async () => HttpResponse.json({ message: 'Invalid code' }, { status: 400 }));
const confirmForgotPasswordLoading = http.post(matchAuthConfirmForgotPassword, async () => { await delay(2000); return HttpResponse.json(authSuccess, { status: 200 }); });
const confirmForgotPasswordNetworkError = http.post(matchAuthConfirmForgotPassword, () => HttpResponse.error());
export const confirmForgotPasswordSuccessHandlers = replaceHandler(7, confirmForgotPasswordSuccess);
export const confirmForgotPasswordErrorHandlers = replaceHandler(7, confirmForgotPasswordError);
export const confirmForgotPasswordLoadingHandlers = replaceHandler(7, confirmForgotPasswordLoading);
export const confirmForgotPasswordNetworkErrorHandlers = replaceHandler(7, confirmForgotPasswordNetworkError);

// Verify username (index 4)
const verifyUsernameSuccessHandler = http.post(matchAuthVerifyUsername, async () => HttpResponse.json(verifyUsernameSuccess, { status: 200 }));
const verifyUsernameError = http.post(matchAuthVerifyUsername, async () => HttpResponse.json({ message: 'User not found' }, { status: 404 }));
const verifyUsernameLoading = http.post(matchAuthVerifyUsername, async () => { await delay(2000); return HttpResponse.json(verifyUsernameSuccess, { status: 200 }); });
const verifyUsernameNetworkError = http.post(matchAuthVerifyUsername, () => HttpResponse.error());
export const verifyUsernameSuccessHandlers = replaceHandler(4, verifyUsernameSuccessHandler);
export const verifyUsernameErrorHandlers = replaceHandler(4, verifyUsernameError);
export const verifyUsernameLoadingHandlers = replaceHandler(4, verifyUsernameLoading);
export const verifyUsernameNetworkErrorHandlers = replaceHandler(4, verifyUsernameNetworkError);

// Delete account (index 1)
const deleteUserSuccess = http.delete(matchDeleteUser, async () => HttpResponse.json({ message: 'User deleted' }, { status: 200 }));
const deleteUserError = http.delete(matchDeleteUser, async () => HttpResponse.json({ message: 'Invalid password' }, { status: 400 }));
const deleteUserLoading = http.delete(matchDeleteUser, async () => { await delay(2000); return HttpResponse.json({ message: 'User deleted' }, { status: 200 }); });
const deleteUserNetworkError = http.delete(matchDeleteUser, () => HttpResponse.error());
export const deleteUserSuccessHandlers = replaceHandler(1, deleteUserSuccess);
export const deleteUserErrorHandlers = replaceHandler(1, deleteUserError);
export const deleteUserLoadingHandlers = replaceHandler(1, deleteUserLoading);
export const deleteUserNetworkErrorHandlers = replaceHandler(1, deleteUserNetworkError);

// MFA / answer OTP (index 12)
const answerOtpSuccess = http.post(matchAuthAnswerOtp, async () => HttpResponse.json(authSuccess, { status: 200 }));
const answerOtpError = http.post(matchAuthAnswerOtp, async () => HttpResponse.json({ message: 'Invalid code' }, { status: 400 }));
const answerOtpLoading = http.post(matchAuthAnswerOtp, async () => { await delay(2000); return HttpResponse.json(authSuccess, { status: 200 }); });
const answerOtpNetworkError = http.post(matchAuthAnswerOtp, () => HttpResponse.error());
export const mfaSuccessHandlers = replaceHandler(12, answerOtpSuccess);
export const mfaErrorHandlers = replaceHandler(12, answerOtpError);
export const mfaLoadingHandlers = replaceHandler(12, answerOtpLoading);
export const mfaNetworkErrorHandlers = replaceHandler(12, answerOtpNetworkError);

// MFA connect (index 14)
const mfaConnectSuccess = http.post(matchAuthMfaConnect, async () => HttpResponse.json(authSuccess, { status: 200 }));
const mfaConnectError = http.post(matchAuthMfaConnect, async () => HttpResponse.json({ message: 'Invalid code' }, { status: 400 }));
const mfaConnectLoading = http.post(matchAuthMfaConnect, async () => { await delay(2000); return HttpResponse.json(authSuccess, { status: 200 }); });
const mfaConnectNetworkError = http.post(matchAuthMfaConnect, () => HttpResponse.error());
export const mfaConnectSuccessHandlers = replaceHandler(14, mfaConnectSuccess);
export const mfaConnectErrorHandlers = replaceHandler(14, mfaConnectError);
export const mfaConnectLoadingHandlers = replaceHandler(14, mfaConnectLoading);
export const mfaConnectNetworkErrorHandlers = replaceHandler(14, mfaConnectNetworkError);

// MFA generate secret (index 13) - form also uses connect (14); submit hits connect
const mfaGenerateSecretSuccess = http.post(matchAuthMfaGenerateSecret, async () => HttpResponse.json({ data: { Session: 'new-session', qrString: 'otpauth://totp/Test?secret=JBSWY3DPEHPK3PXP' } }, { status: 200 }));
const mfaGenerateSecretLoading = http.post(matchAuthMfaGenerateSecret, async () => { await delay(2000); return HttpResponse.json({ data: { Session: 'new-session', qrString: 'otpauth://totp/Test?secret=JBSWY3DPEHPK3PXP' } }, { status: 200 }); });
export const mfaGenerateSecretSuccessHandlers = replaceHandler(13, mfaGenerateSecretSuccess);
export const mfaGenerateSecretLoadingHandlers = replaceHandler(13, mfaGenerateSecretLoading);

// User settings: PUT users/me/account (index 3)
const updateAccountSuccess = http.put(matchUsersMeAccount, async () => HttpResponse.json({ message: 'Updated' }, { status: 200 }));
const updateAccountError = http.put(matchUsersMeAccount, async () => HttpResponse.json({ message: 'Update failed' }, { status: 400 }));
const updateAccountLoading = http.put(matchUsersMeAccount, async () => { await delay(2000); return HttpResponse.json({ message: 'Updated' }, { status: 200 }); });
const updateAccountNetworkError = http.put(matchUsersMeAccount, () => HttpResponse.error());
export const userSettingsSuccessHandlers = replaceHandler(3, updateAccountSuccess);
export const userSettingsErrorHandlers = replaceHandler(3, updateAccountError);
export const userSettingsLoadingHandlers = replaceHandler(3, updateAccountLoading);
export const userSettingsNetworkErrorHandlers = replaceHandler(3, updateAccountNetworkError);
