import { api } from '../api.config';

export type ComplianceLaws = {
  _id: string;
  state: string;
  abbreviation: string;
  /** Wire name is `subjectsRequiredTopicIds` (legacy DB field); these are subject IDs. */
  requiredTopicIds: string[];
};

const ComplianceServices = {
  getComplianceLaws: async (state: string): Promise<ComplianceLaws> => {
    const response = await api.get(`compliance/${encodeURIComponent(state)}`);
    return response.json();
  },
};

export default ComplianceServices;
