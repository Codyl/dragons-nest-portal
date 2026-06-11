import { api } from '../api.config';

export type ComplianceLaws = {
  _id: string;
  state: string;
  abbreviation: string;
  subjectsRequiredTopicIds: string[];
};

const ComplianceServices = {
  getComplianceLaws: async (state: string): Promise<ComplianceLaws> => {
    const response = await api.get(
      `compliance/${encodeURIComponent(state)}`,
    );
    return response.json();
  },
};

export default ComplianceServices;
