import {
  CreateEpicInput,
  CreateSprintInput,
  CreateStoryInput,
  EpicStatus,
  ProjectDetail,
  ProjectStage,
  ScheduleMeetingInput,
  StatusNoteVersion,
  StoryStage,
  UpdateStoryInput,
  ChangeRequest,
  CreateChangeRequestInput,
  ChangeRequestStatus,
  Risk,
  CreateRiskInput,
  RiskStatus,
  Dependency,
  CreateDependencyInput,
  Budget,
  Invoice,
  CreateInvoiceInput,
  UpdateBudgetInput,
  InvoiceStatus,
  Ticket,
  CreateTicketInput,
  TicketStatus,
  SprintAllocation,
} from '../types/domain';
import { HttpClient } from './httpClient';

export interface ProjectService {
  getProject(projectId: string): Promise<ProjectDetail>;
  addMeeting(
    projectId: string,
    input: ScheduleMeetingInput
  ): Promise<ProjectDetail>;
  advanceStage(
    projectId: string,
    stage: ProjectStage
  ): Promise<ProjectDetail>;
  createEpic(projectId: string, input: CreateEpicInput): Promise<ProjectDetail>;
  updateEpic(
    projectId: string,
    epicId: string,
    input: Partial<Omit<CreateEpicInput, 'acceptanceCriteria'>> & {
      acceptanceCriteria?: string[];
    }
  ): Promise<ProjectDetail>;
  updateEpicStatus(
    projectId: string,
    epicId: string,
    status: EpicStatus
  ): Promise<ProjectDetail>;
  deleteEpic(projectId: string, epicId: string): Promise<ProjectDetail>;
  createStory(projectId: string, input: CreateStoryInput): Promise<ProjectDetail>;
  updateStory(
    projectId: string,
    storyId: string,
    input: UpdateStoryInput
  ): Promise<ProjectDetail>;
  updateStoryStage(
    projectId: string,
    storyId: string,
    stage: StoryStage
  ): Promise<ProjectDetail>;
  deleteStory(projectId: string, storyId: string): Promise<ProjectDetail>;
  createSprint(projectId: string, input: CreateSprintInput): Promise<ProjectDetail>;
  startSprint(projectId: string, sprintId: string): Promise<ProjectDetail>;
  endSprint(
    projectId: string,
    sprintId: string,
    options: { moveUnfinishedToNextSprint: boolean }
  ): Promise<ProjectDetail>;
  deleteSprint(projectId: string, sprintId: string): Promise<ProjectDetail>;
  updateStatusNote(projectId: string, statusNote: string): Promise<ProjectDetail>;
  sendMeetingInvites(projectId: string, meetingId: string): Promise<void>;
  getStatusNoteHistory(projectId: string): Promise<StatusNoteVersion[]>;
  getChangeRequests(projectId: string): Promise<ChangeRequest[]>;
  createChangeRequest(projectId: string, input: CreateChangeRequestInput): Promise<ChangeRequest>;
  updateChangeRequestStatus(projectId: string, requestId: string, status: ChangeRequestStatus): Promise<ChangeRequest>;
  getRisks(projectId: string): Promise<Risk[]>;
  createRisk(projectId: string, input: CreateRiskInput): Promise<Risk>;
  updateRisk(projectId: string, riskId: string, input: CreateRiskInput): Promise<Risk>;
  updateRiskStatus(projectId: string, riskId: string, status: RiskStatus): Promise<Risk>;
  getDependencies(projectId: string): Promise<Dependency[]>;
  createDependency(projectId: string, input: CreateDependencyInput): Promise<Dependency>;
  deleteDependency(projectId: string, dependencyId: string): Promise<void>;
  getBudget(projectId: string): Promise<Budget>;
  updateBudget(projectId: string, input: UpdateBudgetInput): Promise<Budget>;
  getInvoices(projectId: string): Promise<Invoice[]>;
  createInvoice(projectId: string, input: CreateInvoiceInput): Promise<Invoice>;
  updateInvoiceStatus(projectId: string, invoiceId: string, status: InvoiceStatus): Promise<Invoice>;
  getTickets(projectId: string): Promise<Ticket[]>;
  createTicket(projectId: string, input: CreateTicketInput): Promise<Ticket>;
  updateTicketStatus(projectId: string, ticketId: string, status: TicketStatus): Promise<Ticket>;
  updateSprintAllocations(
    projectId: string,
    sprintId: string,
    allocations: SprintAllocation[]
  ): Promise<SprintAllocation[]>;
  getStatusDraft(projectId: string): Promise<{ draft: string }>;
}

export class ApiProjectService implements ProjectService {
  constructor(private readonly client: HttpClient) {}

  getProject(projectId: string): Promise<ProjectDetail> {
    return this.client.get<ProjectDetail>(`/api/projects/${projectId}`);
  }

  addMeeting(projectId: string, input: ScheduleMeetingInput): Promise<ProjectDetail> {
    return this.client.post<ProjectDetail>(
      `/api/projects/${projectId}/meetings`,
      input
    );
  }

  advanceStage(projectId: string, stage: ProjectStage): Promise<ProjectDetail> {
    return this.client.put<ProjectDetail>(`/api/projects/${projectId}/stage`, {
      stage,
    });
  }

  createEpic(projectId: string, input: CreateEpicInput): Promise<ProjectDetail> {
    return this.client.post<ProjectDetail>(
      `/api/projects/${projectId}/epics`,
      input
    );
  }

  updateEpic(
    projectId: string,
    epicId: string,
    input: Partial<Omit<CreateEpicInput, 'acceptanceCriteria'>> & {
      acceptanceCriteria?: string[];
    }
  ): Promise<ProjectDetail> {
    return this.client.patch<ProjectDetail>(
      `/api/projects/${projectId}/epics/${epicId}`,
      input
    );
  }

  updateEpicStatus(
    projectId: string,
    epicId: string,
    status: EpicStatus
  ): Promise<ProjectDetail> {
    return this.client.post<ProjectDetail>(
      `/api/projects/${projectId}/epics/${epicId}/status`,
      { status }
    );
  }

  deleteEpic(projectId: string, epicId: string): Promise<ProjectDetail> {
    return this.client.delete<ProjectDetail>(
      `/api/projects/${projectId}/epics/${epicId}`
    );
  }

  createStory(projectId: string, input: CreateStoryInput): Promise<ProjectDetail> {
    return this.client.post<ProjectDetail>(
      `/api/projects/${projectId}/stories`,
      input
    );
  }

  updateStory(
    projectId: string,
    storyId: string,
    input: UpdateStoryInput
  ): Promise<ProjectDetail> {
    return this.client.patch<ProjectDetail>(
      `/api/projects/${projectId}/stories/${storyId}`,
      input
    );
  }

  updateStoryStage(
    projectId: string,
    storyId: string,
    stage: StoryStage
  ): Promise<ProjectDetail> {
    return this.client.post<ProjectDetail>(
      `/api/projects/${projectId}/stories/${storyId}/stage`,
      { stage }
    );
  }

  deleteStory(projectId: string, storyId: string): Promise<ProjectDetail> {
    return this.client.delete<ProjectDetail>(
      `/api/projects/${projectId}/stories/${storyId}`
    );
  }

  createSprint(projectId: string, input: CreateSprintInput): Promise<ProjectDetail> {
    return this.client.post<ProjectDetail>(
      `/api/projects/${projectId}/sprints`,
      input
    );
  }

  startSprint(projectId: string, sprintId: string): Promise<ProjectDetail> {
    return this.client.post<ProjectDetail>(
      `/api/projects/${projectId}/sprints/${sprintId}/start`
    );
  }

  endSprint(
    projectId: string,
    sprintId: string,
    options: { moveUnfinishedToNextSprint: boolean }
  ): Promise<ProjectDetail> {
    return this.client.post<ProjectDetail>(
      `/api/projects/${projectId}/sprints/${sprintId}/end`,
      options
    );
  }

  deleteSprint(projectId: string, sprintId: string): Promise<ProjectDetail> {
    return this.client.delete<ProjectDetail>(
      `/api/projects/${projectId}/sprints/${sprintId}`
    );
  }

  updateStatusNote(projectId: string, statusNote: string): Promise<ProjectDetail> {
    return this.client.patch<ProjectDetail>(
      `/api/projects/${projectId}/status-note`,
      { statusNote }
    );
  }

  sendMeetingInvites(projectId: string, meetingId: string): Promise<void> {
    return this.client.post<void>(
      `/api/projects/${projectId}/meetings/${meetingId}/invite`,
      {}
    );
  }

  getStatusNoteHistory(projectId: string): Promise<StatusNoteVersion[]> {
    return this.client.get<StatusNoteVersion[]>(
      `/api/projects/${projectId}/status-history`
    );
  }

  getChangeRequests(projectId: string): Promise<ChangeRequest[]> {
    return this.client.get<ChangeRequest[]>(`/api/projects/${projectId}/change-requests`);
  }

  createChangeRequest(projectId: string, input: CreateChangeRequestInput): Promise<ChangeRequest> {
    return this.client.post<ChangeRequest>(`/api/projects/${projectId}/change-requests`, input);
  }

  updateChangeRequestStatus(projectId: string, requestId: string, status: ChangeRequestStatus): Promise<ChangeRequest> {
    return this.client.put<ChangeRequest>(`/api/projects/${projectId}/change-requests/${requestId}/status`, status);
  }

  getRisks(projectId: string): Promise<Risk[]> {
    return this.client.get<Risk[]>(`/api/projects/${projectId}/risks`);
  }

  createRisk(projectId: string, input: CreateRiskInput): Promise<Risk> {
    return this.client.post<Risk>(`/api/projects/${projectId}/risks`, input);
  }

  updateRisk(projectId: string, riskId: string, input: CreateRiskInput): Promise<Risk> {
    return this.client.put<Risk>(`/api/projects/${projectId}/risks/${riskId}`, input);
  }

  updateRiskStatus(projectId: string, riskId: string, status: RiskStatus): Promise<Risk> {
    return this.client.put<Risk>(`/api/projects/${projectId}/risks/${riskId}/status`, status);
  }

  getDependencies(projectId: string): Promise<Dependency[]> {
    return this.client.get<Dependency[]>(`/api/projects/${projectId}/dependencies`);
  }

  createDependency(projectId: string, input: CreateDependencyInput): Promise<Dependency> {
    return this.client.post<Dependency>(`/api/projects/${projectId}/dependencies`, input);
  }

  deleteDependency(projectId: string, dependencyId: string): Promise<void> {
    return this.client.delete<void>(`/api/projects/${projectId}/dependencies/${dependencyId}`);
  }

  getBudget(projectId: string): Promise<Budget> {
    return this.client.get<Budget>(`/api/projects/${projectId}/budget`);
  }

  updateBudget(projectId: string, input: UpdateBudgetInput): Promise<Budget> {
    return this.client.put<Budget>(`/api/projects/${projectId}/budget`, input);
  }

  getInvoices(projectId: string): Promise<Invoice[]> {
    return this.client.get<Invoice[]>(`/api/projects/${projectId}/invoices`);
  }

  createInvoice(projectId: string, input: CreateInvoiceInput): Promise<Invoice> {
    return this.client.post<Invoice>(`/api/projects/${projectId}/invoices`, input);
  }

  updateInvoiceStatus(projectId: string, invoiceId: string, status: InvoiceStatus): Promise<Invoice> {
    return this.client.put<Invoice>(`/api/projects/${projectId}/invoices/${invoiceId}/status`, { status });
  }

  getTickets(projectId: string): Promise<Ticket[]> {
    return this.client.get<Ticket[]>(`/api/projects/${projectId}/tickets`);
  }

  createTicket(projectId: string, input: CreateTicketInput): Promise<Ticket> {
    return this.client.post<Ticket>(`/api/projects/${projectId}/tickets`, input);
  }

  updateTicketStatus(projectId: string, ticketId: string, status: TicketStatus): Promise<Ticket> {
    return this.client.put<Ticket>(`/api/projects/${projectId}/tickets/${ticketId}/status`, { status });
  }

  updateSprintAllocations(
    projectId: string,
    sprintId: string,
    allocations: SprintAllocation[]
  ): Promise<SprintAllocation[]> {
    return this.client.put<SprintAllocation[]>(
      `/api/projects/${projectId}/sprints/${sprintId}/allocations`,
      allocations
    );
  }

  getStatusDraft(projectId: string): Promise<{ draft: string }> {
    return this.client.get<{ draft: string }>(
      `/api/projects/${projectId}/automation/status-draft`
    );
  }
}
