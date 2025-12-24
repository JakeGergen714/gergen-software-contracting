import { DocumentRecord, DocumentType } from '../types/domain';
import { HttpClient } from './httpClient';

export interface DocumentService {
  list(projectId: string): Promise<DocumentRecord[]>;
  upload(projectId: string, type: DocumentType, file: File): Promise<DocumentRecord>;
  delete(projectId: string, documentId: string): Promise<void>;
  downloadUrl(projectId: string, documentId: string): string;
}

export class ApiDocumentService implements DocumentService {
  constructor(private readonly client: HttpClient) {}
  list(projectId: string) { return this.client.get<DocumentRecord[]>(`/api/projects/${projectId}/documents`); }
  upload(projectId: string, type: DocumentType, file: File) {
    const form = new FormData();
    form.append('type', type);
    form.append('file', file);
    return this.client.postForm<DocumentRecord>(`/api/projects/${projectId}/documents`, form);
  }
  delete(projectId: string, documentId: string) { return this.client.delete<void>(`/api/projects/${projectId}/documents/${documentId}`); }
  downloadUrl(projectId: string, documentId: string) { return `/api/projects/${projectId}/documents/${documentId}/download`; }
}
