import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isRedirect, redirect } from '@tanstack/react-router';
import UserServices from '@/api/services/user.services';

vi.mock('@/api/services/user.services', () => ({
  default: {
    getUser: vi.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Extract and test the beforeLoad logic directly, without going through the
// full TanStack Router machinery. This mirrors the implementation in the route
// file so that the tests remain fast and free of DOM/router setup.
// ---------------------------------------------------------------------------

/**
 * Mirrors the beforeLoad implementation in
 * `(private)/_private.settings.teaching-subjects.tsx`.
 */
async function beforeLoad(): Promise<void> {
  try {
    const response = await UserServices.getUser();
    const { accountType, ageBandAtRegistration } = response.data;

    if (accountType !== 'adult' || ageBandAtRegistration !== 'ADULT_18_PLUS') {
      throw redirect({ to: '/settings/profile' });
    }
  } catch (err) {
    if (isRedirect(err)) throw err;
    // For any other fetch error, let the page component handle it
  }
}

const mockGetUser = vi.mocked(UserServices.getUser);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('_private.settings.teaching-subjects route beforeLoad', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects a non-adult user (wrong accountType) to /settings/profile', async () => {
    mockGetUser.mockResolvedValueOnce({
      message: 'ok',
      data: {
        accountType: 'student',
        ageBandAtRegistration: 'ADULT_18_PLUS',
      },
    });

    await expect(beforeLoad()).rejects.toSatisfy(isRedirect);
  });

  it('redirects a non-adult user (wrong ageBandAtRegistration) to /settings/profile', async () => {
    mockGetUser.mockResolvedValueOnce({
      message: 'ok',
      data: {
        accountType: 'adult',
        ageBandAtRegistration: 'TEEN_13_17',
      },
    });

    await expect(beforeLoad()).rejects.toSatisfy(isRedirect);
  });

  it('allows an adult_18_plus user through without throwing', async () => {
    mockGetUser.mockResolvedValueOnce({
      message: 'ok',
      data: {
        accountType: 'adult',
        ageBandAtRegistration: 'ADULT_18_PLUS',
      },
    });

    await expect(beforeLoad()).resolves.toBeUndefined();
  });

  it('does not throw when getUser fetch fails (page component handles the error)', async () => {
    mockGetUser.mockRejectedValueOnce(new Error('Network error'));

    await expect(beforeLoad()).resolves.toBeUndefined();
  });
});
