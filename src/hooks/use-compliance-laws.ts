import { useQuery } from '@tanstack/react-query';
import ComplianceServices from '@/api/services/compliance.services';

const useComplianceLaws = (state: string | null | undefined) =>
  useQuery({
    queryKey: ['compliance', state],
    queryFn: () => ComplianceServices.getComplianceLaws(state!),
    enabled: !!state,
  });

export default useComplianceLaws;
