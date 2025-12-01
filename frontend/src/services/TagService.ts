import { Tag, TagType, AttachTagInput } from '../types/domain';
import { HttpClient } from './httpClient';

export interface TagService {
  listTags(): Promise<Tag[]>;
  createTag(name: string, type: TagType): Promise<Tag>;
  deleteTag(id: string): Promise<void>;
  listEpicTags(projectId: string, epicId: string): Promise<Tag[]>;
  attachEpicTag(projectId: string, epicId: string, input: AttachTagInput): Promise<Tag>;
  detachEpicTag(projectId: string, epicId: string, tagId: string): Promise<void>;
}

export class ApiTagService implements TagService {
  constructor(private readonly client: HttpClient) {}
  listTags() { return this.client.get<Tag[]>('/api/tags'); }
  createTag(name: string, type: TagType) { return this.client.post<Tag>('/api/tags', { name, type }); }
  deleteTag(id: string) { return this.client.delete<void>(`/api/tags/${id}`); }
  listEpicTags(projectId: string, epicId: string) { return this.client.get<Tag[]>(`/api/projects/${projectId}/epics/${epicId}/tags`); }
  attachEpicTag(projectId: string, epicId: string, input: AttachTagInput) { return this.client.post<Tag>(`/api/projects/${projectId}/epics/${epicId}/tags`, input); }
  detachEpicTag(projectId: string, epicId: string, tagId: string) { return this.client.delete<void>(`/api/projects/${projectId}/epics/${epicId}/tags/${tagId}`); }
}
