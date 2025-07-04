export interface BlockData {
  sNo: number;
  "district+block": string;
  allocationDate: string;
  nameOfDistrict: string;
  districtCode: number;
  nameOfBlock: string;
  blockCode: number;
  noOfGp: number;
  priority: string;
  dtpStatus: string;
  dtpPlannedDate: string;
  dtpSubmissionDate: string;
  dtpApprovalDate: string;
  existingOfc: number;
  proposedOfc: number;
  id: number;
}

export interface SurveyData {
  sNo: number;
  block: string;
  blockCode: number;
  district: string;
  districtCode: number;
  appDataUploadStatus: string;
  dtpApprovalStatus: string;
  newlyCreated: number;
  existingConnectedGp: number;
  totalGp: number;
  existingOfc: number;
  existingOfcUnused: number;
  newOfc: number;
  // HOTO Survey fields
  hotoTeamNames: string;
  hotoSurveyAgency: string;
  hotoStartDate: string;
  hotoEndDate: string;
  hNoOfAblTeams: string;
  hotoGpDone: number;
  hotoGpPending: number;
  hotoOfcDone: number;
  hotoOfcPending: number;
  hotoPitCount: number;
  hotoSurveyStatus: string;
  hotoRemarks: string;
  // Feasibility Survey fields
  feasibiltiyTeamNames: string;
  feasibilityAgencyName: string;
  feasibilityStartDate: string;
  feasibilityEndDate: string;
  fNoOfAblTeams: number;
  feasibilityGpDone: number;
  feasibilityGpPending: number;
  feasibilityOfcDone: number;
  feasibilityOfcPending: number;
  feasibilityStatus: string;
  feasibilityVideoDone: number;
  feasibilityRemarks: string;
  feasibilityVideoStatus: string;
  feasibilityVideoAgency: string;
  feasibilityVideoTeam: string;
  surveyReportSubmissionStatus: string;
  id: number;
}

export interface ApiResponse {
  [key: string]: BlockData[] | SurveyData[];
}

export interface SummaryStats {
  total: number;
  approved?: number;
  submitted?: number;
  onHold?: number;
  pending?: number;
  completed?: number;
  ongoing?: number;
  surveyRequired?: number;
  surveyWIP?: number;
  totalExistingKm: number;
  totalPlannedKm: number;
  completedKm?: number;
  pendingKm?: number;
  weeklyApproved?: number;
  weeklySubmitted?: number;
  weeklyOnHold?: number;
}

export interface DistrictSummary {
  name: string;
  total: number;
  approved: number;
  submitted: number;
  onHold: number;
  pending: number;
  existingKm: number;
  plannedKm: number;
}

export interface SurveyDistrictSummary {
  name: string;
  total: number;
  completed: number;
  ongoing: number;
  pending: number;
  totalKm: number;
  completedKm: number;
  pendingKm: number;
}

export interface ProjectProgress {
  completionPercentage: number;
  estimatedCompletionDate: Date;
  approvedBlocks: number;
  totalBlocks: number;
  approvalRate: number;
}