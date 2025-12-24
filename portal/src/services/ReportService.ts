import { HttpClient } from './httpClient';

export interface ReportService {
  downloadPortfolioCsv(businessId: string): Promise<void>;
  downloadSprintCsv(projectId: string, sprintId: string): Promise<void>;
}

export class ApiReportService implements ReportService {
  constructor(private client: HttpClient) {}

  async downloadPortfolioCsv(businessId: string): Promise<void> {
    const filename = `portfolio_report_${new Date().toISOString().split('T')[0]}.csv`;
    await this.client.download(`/reports/portfolio/${businessId}/csv`, filename);
  }

  async downloadSprintCsv(projectId: string, sprintId: string): Promise<void> {
    const filename = `sprint_report_${new Date().toISOString().split('T')[0]}.csv`;
    await this.client.download(`/reports/projects/${projectId}/sprints/${sprintId}/csv`, filename);
  }
}
