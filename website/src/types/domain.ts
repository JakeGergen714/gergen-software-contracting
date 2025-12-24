export type ProjectStage =
  | 'REQUIREMENTS'
  | 'PLANNING'
  | 'EXECUTION'
  | 'MAINTAINING';

export type ProjectApprovalState =
  | 'DRAFT'
  | 'AWAITING_CLIENT'
  | 'CLIENT_APPROVED'
  | 'CHANGES_REQUESTED';

export type EpicStatus =
  | 'PLANNED'
  | 'AWAITING_APPROVAL'
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'DONE';

export type StoryStage =
  | 'BACKLOG'
  | 'READY'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'DONE';

export type SprintStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETE';

export interface UserPreferences {
  emailDigest: boolean;
  inAppAlerts: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CLIENT_OWNER' | 'CLIENT_MEMBER' | 'ADMIN' | 'SUPPORT' | 'FINANCE';
  preferences?: UserPreferences;
}

export interface Business {
  id: string;
  name: string;
  primaryContactUserId: string;
  createdAt: string;
}

export interface Meeting {
  id: string;
  projectId: string;
  stage: ProjectStage;
  scheduledAt: string;
  type: 'DISCOVERY' | 'REVIEW' | 'STANDUP';
  locationUrl: string;
  summary: string;
  notes?: string;
  attendees?: string[];
}

export interface SprintAllocation {
  id: string;
  sprintId: string;
  userId: string;
  allocatedHours: number;
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  startAt: string;
  endAt: string;
  goal: string;
  status: SprintStatus;
  notes?: string;
  allocations?: SprintAllocation[];
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  capacityHours?: number;
}

export type EpicType = 'FEATURE' | 'DEFECT' | 'MAINTENANCE' | 'COMPLIANCE' | 'PERFORMANCE';

export interface DefectDetails {
  reportedBy?: string;
  severity?: string;
  impactSummary?: string;
  stepsToReproduce?: string;
}

export interface Epic {
  id: string;
  projectId: string;
  name: string;
  description: string;
  color: string;
  status: EpicStatus;
  type?: EpicType;
  acceptanceCriteria: string[];
  clientSummary?: string;
  tags?: Tag[];
  defectDetails?: DefectDetails;
}

export interface Story {
  id: string;
  epicId: string;
  projectId: string;
  title: string;
  description?: string;
  acceptanceCriteria: string[];
  stage: StoryStage;
  sprintId?: string;
  points?: number;
  planningOrder?: number | null;
  tags?: Tag[];
}

export interface ProjectSummary {
  id: string;
  businessId: string;
  name: string;
  description: string;
  stage: ProjectStage;
  approvalState: ProjectApprovalState;
  kickoffCallAt: string;
  updatedAt: string;
  statusNote?: string;
}

export interface ProjectDetail extends ProjectSummary {
  epics: Epic[];
  stories: Story[];
  sprints: Sprint[];
  meetings: Meeting[];
  statusNote?: string;
  members?: ProjectMember[];
}

export interface BusinessOverview {
  business: Business;
  projects: ProjectSummary[];
}

export interface SignupInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  businessName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateProjectInput {
  name: string;
  description: string;
  kickoffCallAt: string;
}

export interface CreateStoryInput {
  epicId: string;
  title: string;
  description?: string;
  acceptanceCriteria: string[];
  points?: number;
  sprintId?: string | null;
  stage?: StoryStage;
  planningOrder?: number | null;
}

export interface UpdateStoryInput {
  epicId: string;
  title: string;
  description?: string;
  acceptanceCriteria: string[];
  points?: number;
  sprintId?: string | null;
  stage: StoryStage;
  planningOrder?: number | null;
}

export interface CreateEpicInput {
  name: string;
  description: string;
  color: string;
  acceptanceCriteria: string[];
  clientSummary?: string;
  type?: EpicType;
  defectDetails?: DefectDetails;
}

export interface CreateSprintInput {
  name: string;
  goal: string;
  startAt: string;
  endAt: string;
}

export interface EndSprintOptions {
  moveUnfinishedToNextSprint: boolean;
}

export interface ScheduleMeetingInput {
  stage: ProjectStage;
  scheduledAt: string;
  type: 'DISCOVERY' | 'REVIEW' | 'STANDUP';
  locationUrl: string;
  summary: string;
  notes?: string;
  attendees?: string[];
}

export interface UserSession {
  token: string;
  user: User;
  business: Business;
}

// New enums & types for extensions
export type TagType = 'REGULATORY' | 'PERFORMANCE' | 'MAINTENANCE' | 'SECURITY' | 'OTHER';
export interface Tag { id: string; name: string; type: TagType; createdAt: string; }

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'APPROVAL_CHANGE';
export interface AuditEvent { id: string; projectId?: string; entityType: string; entityId?: string; action: AuditAction; detailJson?: string; userId: string; createdAt: string; }

export interface StatusNoteVersion { id: string; projectId: string; noteText: string; userId: string; createdAt: string; }

export type DocumentType = 'PROPOSAL_DRAFT' | 'CONTRACT' | 'POLICY' | 'LOG' | 'DESIGN_ARTIFACT';
export interface DocumentRecord { id: string; projectId?: string; businessId?: string; type: DocumentType; filename: string; sizeBytes: number; version: number; uploadedBy: string; createdAt: string; }

export interface AttachTagInput { tagId?: string; name?: string; type?: TagType; }

export type ProposalStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'REJECTED' | 'SUPERSEDED';

export interface Proposal {
  id: string;
  projectId: string;
  version: number;
  status: ProposalStatus;
  content: string;
  pricing: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProposalInput {
  content: string;
  pricing: string;
}

export type ChangeRequestStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export interface ChangeRequest {
  id: string;
  projectId: string;
  title: string;
  description: string;
  impact: string;
  status: ChangeRequestStatus;
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
}

export interface CreateChangeRequestInput {
  title: string;
  description: string;
  impact: string;
}

// Risk types
export type RiskStatus = 'OPEN' | 'MITIGATED' | 'CLOSED' | 'REALIZED';
export type RiskProbability = 'LOW' | 'MEDIUM' | 'HIGH' | 'CERTAIN';
export type RiskImpact = 'NEGLIGIBLE' | 'MARGINAL' | 'CRITICAL' | 'CATASTROPHIC';

export interface Risk {
  id: string;
  projectId: string;
  title: string;
  description: string;
  probability: RiskProbability;
  impact: RiskImpact;
  mitigationPlan: string;
  status: RiskStatus;
  linkedEpicId?: string;
  linkedStoryId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRiskInput {
  title: string;
  description: string;
  probability: RiskProbability;
  impact: RiskImpact;
  mitigationPlan: string;
  linkedEpicId?: string;
  linkedStoryId?: string;
}

export type DependencyType = 'BLOCKS' | 'RELATES_TO';

export interface Dependency {
  id: string;
  projectId: string;
  sourceId: string;
  targetId: string;
  type: DependencyType;
  createdAt: string;
}

export interface CreateDependencyInput {
  sourceId: string;
  targetId: string;
  type: DependencyType;
}

export interface ProjectPortfolioSummary {
  id: string;
  name: string;
  stage: ProjectStage;
  health: string;
  progress: number;
  activeRisks: number;
  totalPoints: number;
  completedPoints: number;
}

export interface PortfolioDashboard {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalEpics: number;
  totalStories: number;
  totalPoints: number;
  completedPoints: number;
  overallVelocity: number;
  riskSummary: Record<string, number>;
  projects: ProjectPortfolioSummary[];
}

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface Budget {
  id: string;
  projectId: string;
  totalAmount: number;
  spentAmount: number;
  currency: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  projectId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  dueDate: string;
  paidDate?: string;
  createdAt: string;
}

export interface CreateInvoiceInput {
  invoiceNumber: string;
  amount: number;
  currency: string;
  dueDate: string;
}

export interface UpdateBudgetInput {
  totalAmount: number;
}

export const TicketStatusValues = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  WAITING_FOR_CLIENT: 'WAITING_FOR_CLIENT',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED'
} as const;
export type TicketStatus = typeof TicketStatusValues[keyof typeof TicketStatusValues];

export const TicketSeverity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
} as const;
export type TicketSeverity = typeof TicketSeverity[keyof typeof TicketSeverity];

export interface Ticket {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TicketStatus;
  severity: TicketSeverity;
  createdAt: string;
  updatedAt: string;
  slaDueAt?: string;
}

export interface CreateTicketInput {
  title: string;
  description: string;
  severity: TicketSeverity;
}


export interface SearchResult {
  id: string;
  type: 'PROJECT' | 'STORY' | 'EPIC' | 'DOC';
  title: string;
  description?: string;
  projectId?: string;
  projectName?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  read: boolean;
  createdAt: string;
  link?: string;
}

