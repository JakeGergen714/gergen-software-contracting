import { AuditEvent, StatusNoteVersion } from '../types/domain';
import { HttpClient } from './httpClient';

export interface AuditService {
  listAudit(projectId: string): Promise<AuditEvent[]>;
  listStatusNoteVersions(projectId: string): Promise<StatusNoteVersion[]>;
}

export class ApiAuditService implements AuditService {
  constructor(private readonly client: HttpClient) {}
  listAudit(projectId: string) { return this.client.get<AuditEvent[]>(`/api/projects/${projectId}/audit`); }
  listStatusNoteVersions(projectId: string) { return this.client.get<StatusNoteVersion[]>(`/api/projects/${projectId}/status-note-versions`); }
}
