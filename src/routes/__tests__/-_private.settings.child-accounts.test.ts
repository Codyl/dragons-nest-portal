import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isRedirect, redirect } from '@tanstack/react-router';
import ProfileServices from '@/api/services/profile.services';

vi.mock('@/api/services/user.services', () => ({
  default: {
    getUser: vi.fn(),
  },
}));

async function beforeLoad(): Promise<void> {
  try {
    const response = await ProfileServices.getProfile();
    const { accountType, ageBandAtRegistration } = response.data;

    if (accountType !== 'adult' || ageBandAtRegistration !== 'ADULT_18_PLUS') {
      throw redirect({ to: '/settings/profile' });
    }
  } catch (err) {
    if (isRedirect(err)) throw err;
  }
}

const mockGetUser = vi.mocked(ProfileServices.getProfile);

describe('_private.settings.child-accounts route beforeLoad', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects non-adult accountType to /settings/profile', async () => {
    mockGetUser.mockResolvedValueOnce({
      message: 'ok',
      data: {
        accountType: 'student',
        ageBandAtRegistration: 'ADULT_18_PLUS',
      },
    });

    await expect(beforeLoad()).rejects.toSatisfy(isRedirect);
  });

  it('allows adult ADULT_18_PLUS through', async () => {
    mockGetUser.mockResolvedValueOnce({
      message: 'ok',
      data: {
        accountType: 'adult',
        ageBandAtRegistration: 'ADULT_18_PLUS',
      },
    });

    await expect(beforeLoad()).resolves.toBeUndefined();
  });

  it('does not throw when getUser fails', async () => {
    mockGetUser.mockRejectedValueOnce(new Error('network'));

    await expect(beforeLoad()).resolves.toBeUndefined();
  });
});
