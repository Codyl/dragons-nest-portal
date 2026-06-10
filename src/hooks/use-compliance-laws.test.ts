import { describe, expect, it, vi, beforeEach } from 'vite-plus/test';
import { useQuery } from '@tanstack/react-query';
import useComplianceLaws from './use-compliance-laws';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

const useQueryMock = vi.mocked(useQuery);

describe('useComplianceLaws', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useQueryMock.mockReturnValue({} as never);
  });

  it('disables query when state is null', () => {
    useComplianceLaws(null);
    const call = useQueryMock.mock.calls[0]?.[0];
    expect(call.enabled).toBe(false);
  });

  it('disables query when state is undefined', () => {
    useComplianceLaws(undefined);
    const call = useQueryMock.mock.calls[0]?.[0];
    expect(call.enabled).toBe(false);
  });

  it('enables query when state is a non-empty string', () => {
    useComplianceLaws('tx');
    const call = useQueryMock.mock.calls[0]?.[0];
    expect(call.enabled).toBe(true);
    expect(call.queryKey).toEqual(['compliance', 'tx']);
  });
});
