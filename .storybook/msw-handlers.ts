import { http, HttpResponse, delay } from 'msw';

// API path patterns - ky uses prefixUrl, MSW matches with * for origin
const matchChangePassword = '*/users/me/change-password';
const matchDeleteUser = '*/users/me';
const matchUsersMe = '*/users/me';
const matchUsersMeAccount = '*/users/me/account';
const matchAuthVerifyUsername = '*/auth/verify-username';
const matchAuthInitiateLogin = '*/auth/initiate-login';
const matchAuthForgotPassword = '*/auth/forgot-password';
const matchAuthConfirmForgotPassword = '*/auth/confirm-forgot-password';
const matchAuthInitiateSignup = '*/auth/initiate-signup';
const matchAuthConfirmSignup = '*/auth/confirm-signup';
const matchAuthResendCode = '*/auth/confirm-signup/resend-code';
const matchAuthMfa = '*/auth/mfa';
const matchAuthAnswerOtp = '*/auth/answer-otp';
const matchAuthMfaGenerateSecret = '*/auth/mfa/generate-authenticator-secret';
const matchAuthMfaConnect = '*/auth/mfa/connect-authenticator-app';

// Default auth success response
const authSuccess = {
  data: {
    Session: 'test-session',
    ChallengeName: null,
    AuthenticationResult: {
      AccessToken: 'test-access-token',
      RefreshToken: 'test-refresh-token',
      IdToken: 'test-id-token',
    },
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
];

// Handlers for other APIs (used with change-password variants)
const otherHandlers = handlers.slice(1);

// Change password story variants
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
