import { describe, expect, it } from 'vite-plus/test';
import { resolveAccountSetupFlow } from './account-setup-flow';

describe('resolveAccountSetupFlow', () => {
  it('maps INDEPENDENT to teen / teen13to17 / student', () => {
    expect(
      resolveAccountSetupFlow({
        accountStatus: 'INDEPENDENT',
        sessionMonth: null,
        sessionYear: null,
      }),
    ).toEqual({
      setupFlow: 'teen',
      expectedBirthBand: 'teen13to17',
      formAccountType: 'student',
    });
  });

  it('maps MANAGED to teen / under13 / student', () => {
    expect(
      resolveAccountSetupFlow({
        accountStatus: 'MANAGED',
        sessionMonth: null,
        sessionYear: null,
      }),
    ).toEqual({
      setupFlow: 'teen',
      expectedBirthBand: 'under13',
      formAccountType: 'student',
    });
  });

  it('maps ADULT to adult flow', () => {
    expect(
      resolveAccountSetupFlow({
        accountStatus: 'ADULT',
        sessionMonth: null,
        sessionYear: null,
      }),
    ).toEqual({
      setupFlow: 'adult',
      expectedBirthBand: 'adult',
      formAccountType: 'adult',
    });
  });

  it('uses session student path when accountStatus is null and session is teen', () => {
    expect(
      resolveAccountSetupFlow({
        accountStatus: null,
        sessionMonth: 6,
        sessionYear: 2010,
      }),
    ).toEqual({
      setupFlow: 'teen',
      expectedBirthBand: 'teen13to17',
      formAccountType: 'student',
    });
  });

  it('uses session adult path when accountStatus is null and session is 18+', () => {
    expect(
      resolveAccountSetupFlow({
        accountStatus: null,
        sessionMonth: 1,
        sessionYear: 1990,
      }),
    ).toEqual({
      setupFlow: 'adult',
      expectedBirthBand: 'adult',
      formAccountType: 'adult',
    });
  });

  it('prefers accountStatus over conflicting session', () => {
    expect(
      resolveAccountSetupFlow({
        accountStatus: 'ADULT',
        sessionMonth: 6,
        sessionYear: 2010,
      }),
    ).toMatchObject({ setupFlow: 'adult', formAccountType: 'adult' });
  });
});
