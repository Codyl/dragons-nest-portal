// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vite-plus/test';
import ComplianceSidebar from './_private.compliance-sidebar';
import type { HomeschoolPathway } from '@/api/services/compliance.services';

afterEach(() => {
  cleanup();
});

const basePathway: HomeschoolPathway = {
  name: 'Default',
  parentRequirements: { degreeRequired: false, minimumEducationLevel: 'none', backgroundCheck: false },
  notification: { required: true, frequency: 'annual', to: 'state' },
  requiredSubjects: { required: false, subjects: [] },
  assessment: { required: true, type: 'test', frequency: 'annual', submittedToState: false },
  recordKeeping: { required: false, details: [] },
  instructionRequirements: {},
  teacherQualification: { required: false },
  diplomaAuthority: { parentIssued: true, stateRecognized: false },
};

describe('ComplianceSidebar', () => {
  it('shows 0% when no items are checked', () => {
    render(
      <ComplianceSidebar
        stateName="New York"
        abbreviation="NY"
        compulsoryAttendance={{ startAge: 6, endAge: 16 }}
        pathway={basePathway}
        completionItems={{ notification: false, assessment: false }}
        totalItems={2}
      />,
    );
    expect(screen.getByTestId('completion-percentage').textContent).toBe('0%');
  });

  it('calculates correct percentage with rounding', () => {
    render(
      <ComplianceSidebar
        stateName="New York"
        abbreviation="NY"
        compulsoryAttendance={{ startAge: 6, endAge: 16 }}
        pathway={basePathway}
        completionItems={{ a: true, b: true, c: false }}
        totalItems={3}
      />,
    );
    // 2/3 = 66.666... → 67%
    expect(screen.getByTestId('completion-percentage').textContent).toBe('67%');
  });

  it('displays state name and abbreviation', () => {
    render(
      <ComplianceSidebar
        stateName="California"
        abbreviation="CA"
        compulsoryAttendance={{ startAge: 6, endAge: 18 }}
        pathway={basePathway}
        completionItems={{}}
        totalItems={0}
      />,
    );
    expect(screen.getByText('California (CA)')).toBeTruthy();
  });

  it('displays compulsory attendance age range and notes', () => {
    render(
      <ComplianceSidebar
        stateName="Texas"
        abbreviation="TX"
        compulsoryAttendance={{ startAge: 6, endAge: 18, notes: 'Exceptions apply' }}
        pathway={basePathway}
        completionItems={{}}
        totalItems={0}
      />,
    );
    expect(screen.getByText('Ages 6–18')).toBeTruthy();
    expect(screen.getByText('Exceptions apply')).toBeTruthy();
  });

  it('derives deadlines from pathway frequencies', () => {
    render(
      <ComplianceSidebar
        stateName="New York"
        abbreviation="NY"
        compulsoryAttendance={{ startAge: 6, endAge: 16 }}
        pathway={basePathway}
        completionItems={{}}
        totalItems={0}
      />,
    );
    expect(screen.getByText('Annual notification required')).toBeTruthy();
    expect(screen.getByText('Annual assessment required')).toBeTruthy();
  });

  it('shows one-time notification label', () => {
    const pathway = { ...basePathway, notification: { ...basePathway.notification, frequency: 'once' as const } };
    render(
      <ComplianceSidebar
        stateName="Alaska"
        abbreviation="AK"
        compulsoryAttendance={{ startAge: 7, endAge: 16 }}
        pathway={pathway}
        completionItems={{}}
        totalItems={0}
      />,
    );
    expect(screen.getByText('One-time notification required')).toBeTruthy();
  });
});
