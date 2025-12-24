import {
  BusinessOverview,
  CreateProjectInput,
  ProjectDetail,
  ProjectSummary,
  PortfolioDashboard,
} from '../types/domain';
import { HttpClient } from './httpClient';

export interface BusinessService {
  getOverview(businessId: string): Promise<BusinessOverview>;
  listProjects(businessId: string): Promise<ProjectSummary[]>;
  getPortfolioDashboard(businessId: string): Promise<PortfolioDashboard>;
  createProject(
    businessId: string,
    input: CreateProjectInput
  ): Promise<ProjectDetail>;
  createIntakeProject(
    businessId: string,
    input: CreateIntakeProjectInput
  ): Promise<ProjectDetail>;
}

export class ApiBusinessService implements BusinessService {
  constructor(private readonly client: HttpClient) {}

  getOverview(businessId: string): Promise<BusinessOverview> {
    return this.client.get<BusinessOverview>(
      `/api/businesses/${businessId}/overview`
    );
  }

  listProjects(businessId: string): Promise<ProjectSummary[]> {
    return this.client.get<ProjectSummary[]>(
      `/api/businesses/${businessId}/projects`
    );
  }

  getPortfolioDashboard(businessId: string): Promise<PortfolioDashboard> {
    return this.client.get<PortfolioDashboard>(
      `/api/businesses/${businessId}/portfolio`
    );
  }

  createProject(
    businessId: string,
    input: CreateProjectInput
  ): Promise<ProjectDetail> {
    return this.client.post<ProjectDetail>(
      `/api/businesses/${businessId}/projects`,
      input
    );
  }

  createIntakeProject(
    businessId: string,
    input: CreateIntakeProjectInput
  ): Promise<ProjectDetail> {
    return this.client.post<ProjectDetail>(
      `/api/businesses/${businessId}/intake-project`,
      input
    );
  }
}

// Intake wizard specific request shape
export interface CreateIntakeProjectInput {
  projectName: string;
  description: string;
  industry: string; // e.g., LOGISTICS, HEALTHCARE, SAAS
  questionnaireAnswers: Record<string, string | number | boolean | null>;
  kickoffCallAt: string; // ISO datetime-local
}
