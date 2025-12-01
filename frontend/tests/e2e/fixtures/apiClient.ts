import { request, APIRequestContext } from '@playwright/test';

export interface TestProjectSeed {
  projectId?: string;
  name?: string;
}

export class TestApiClient {
  private readonly baseUrl: string;
  private readonly context: APIRequestContext;

  private constructor(baseUrl: string, context: APIRequestContext) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.context = context;
  }

  static async create(): Promise<TestApiClient> {
    const apiBase = process.env.E2E_API_BASE_URL ?? 'http://localhost:8080/api';
    const context = await request.newContext();
    return new TestApiClient(apiBase, context);
  }

  async reset(): Promise<void> {
    const resp = await this.context.post(`${this.baseUrl}/test/reset`);
    if (!resp.ok()) {
      throw new Error(`Failed to reset test data: ${resp.status()} ${resp.statusText()}`);
    }
  }

  async createAdminSampleProject(seed?: TestProjectSeed): Promise<any> {
    const resp = await this.context.post(`${this.baseUrl}/test/admin-sample-project`, {
      data: seed ?? {},
    });
    if (!resp.ok()) {
      throw new Error(`Failed to create admin sample project: ${resp.status()} ${resp.statusText()}`);
    }
    return await resp.json();
  }
}
