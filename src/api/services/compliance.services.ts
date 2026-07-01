import { api } from '../api.config';

// --- Sub-types mirroring backend entity ---

export type BooleanOrVaries = boolean | 'varies';

export type ComplianceParentRequirements = {
  degreeRequired: BooleanOrVaries;
  minimumEducationLevel: 'none' | 'high_school' | 'college' | 'teacher_cert' | 'varies';
  backgroundCheck: BooleanOrVaries;
};

export type ComplianceNotification = {
  required: boolean;
  frequency: 'none' | 'once' | 'annual';
  to: 'state' | 'district' | 'school' | 'none';
};

export type ComplianceRequiredSubjects = {
  required: boolean;
  subjects: { name: string; mandatoryGrades?: string; notes?: string }[];
};

export type ComplianceAssessment = {
  required: boolean;
  type: 'none' | 'test' | 'portfolio' | 'evaluation' | 'hybrid';
  frequency: 'none' | 'annual' | 'periodic';
  submittedToState: boolean;
};

export type ComplianceRecordKeeping = {
  required: boolean;
  details: string[];
};

export type ComplianceInstructionRequirements = {
  hoursPerYear?: number;
  daysPerYear?: number;
  equivalencyStandard?: string;
};

export type ComplianceTeacherQualification = {
  required: boolean;
  description?: string;
};

export type ComplianceDiplomaAuthority = {
  parentIssued: boolean;
  stateRecognized: boolean;
};

export type HomeschoolPathway = {
  name: string;
  parentRequirements: ComplianceParentRequirements;
  notification: ComplianceNotification;
  requiredSubjects: ComplianceRequiredSubjects;
  assessment: ComplianceAssessment;
  recordKeeping: ComplianceRecordKeeping;
  instructionRequirements: ComplianceInstructionRequirements;
  teacherQualification: ComplianceTeacherQualification;
  diplomaAuthority: ComplianceDiplomaAuthority;
};

export type ComplianceSource = {
  name: string;
  url: string;
  lastVerified: string;
};

// --- Main types ---

export type ComplianceLaws = {
  _id: string;
  state: string;
  abbreviation: string;
  regulationProfile: { level: 'none' | 'low' | 'moderate' | 'high'; description: string };
  compulsoryAttendance: { startAge: number; endAge: number; notes?: string };
  pathways: HomeschoolPathway[];
  sources: ComplianceSource[];
  /** Wire name is `subjectsRequiredTopicIds` (legacy DB field); these are subject IDs. */
  requiredSubjectIds: string[];
  immunizationRequired: boolean;
};

export type ComplianceCompletion = {
  items: Record<string, boolean>;
};

const ComplianceServices = {
  getComplianceLaws: async (state: string): Promise<ComplianceLaws> => {
    const response = await api.get(`compliance/${encodeURIComponent(state)}`);
    return response.json();
  },

  getCompletion: async (state: string, managedUserId: string): Promise<ComplianceCompletion> => {
    const response = await api.get(
      `compliance/completion?state=${encodeURIComponent(state)}&managedUserId=${encodeURIComponent(managedUserId)}`,
    );
    return response.json();
  },

  toggleCompletion: async (payload: {
    state: string;
    managedUserId: string;
    itemKey: string;
    completed: boolean;
  }): Promise<ComplianceCompletion> => {
    const response = await api.patch('compliance/completion', { json: payload });
    return response.json();
  },
};

export default ComplianceServices;
