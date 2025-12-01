import { CreateProposalInput, Proposal, ProposalStatus } from '../types/domain';
import { HttpClient } from './httpClient';

export interface ProposalService {
  listProposals(projectId: string): Promise<Proposal[]>;
  createProposal(projectId: string, input: CreateProposalInput): Promise<Proposal>;
  updateStatus(projectId: string, proposalId: string, status: ProposalStatus): Promise<Proposal>;
}

export class ApiProposalService implements ProposalService {
  constructor(private readonly client: HttpClient) {}

  listProposals(projectId: string) {
    return this.client.get<Proposal[]>(`/api/projects/${projectId}/proposals`);
  }

  createProposal(projectId: string, input: CreateProposalInput) {
    return this.client.post<Proposal>(`/api/projects/${projectId}/proposals`, input);
  }

  updateStatus(projectId: string, proposalId: string, status: ProposalStatus) {
    return this.client.post<Proposal>(`/api/projects/${projectId}/proposals/${proposalId}/status`, { status });
  }
}
