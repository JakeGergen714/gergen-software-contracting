import { SearchResult } from '../types/domain';
import { HttpClient } from './httpClient';

export interface SearchService {
  search(query: string): Promise<SearchResult[]>;
}

export class ApiSearchService implements SearchService {
  constructor(private readonly client: HttpClient) {}

  search(query: string): Promise<SearchResult[]> {
    return this.client.get<SearchResult[]>(`/api/search?q=${encodeURIComponent(query)}`);
  }
}
