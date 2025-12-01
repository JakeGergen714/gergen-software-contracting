type TokenProvider = () => Promise<string | null>;

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data === 'string') return data;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
  } catch (err) {
    // ignore json parse issues
  }
  return `Request failed with status ${response.status}`;
}

export class HttpClient {
  constructor(private readonly baseUrl: string, private readonly tokenProvider?: TokenProvider) {}

  get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'GET' });
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: 'POST', body });
  }

  put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: 'PUT', body });
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: 'PATCH', body });
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }

  postForm<T>(path: string, form: FormData): Promise<T> {
    return this.requestForm<T>(path, form);
  }

  private async requestForm<T>(path: string, form: FormData): Promise<T> {
    const headers = new Headers();
    if (this.tokenProvider) {
      const token = await this.tokenProvider();
      if (token) headers.set('Authorization', `Bearer ${token}`);
    }
    const response = await fetch(`${this.baseUrl}${path}`, { method: 'POST', headers, body: form });
    if (!response.ok) {
      throw new Error(await parseError(response));
    }
    const text = await response.text();
    return text ? (JSON.parse(text) as T) : (undefined as T);
  }

  async download(path: string, filename: string): Promise<void> {
    const headers = new Headers();
    if (this.tokenProvider) {
      const token = await this.tokenProvider();
      if (token) headers.set('Authorization', `Bearer ${token}`);
    }
    const response = await fetch(`${this.baseUrl}${path}`, { method: 'GET', headers });
    if (!response.ok) {
      throw new Error(await parseError(response));
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  private async request<T>(path: string, options: { method: string; body?: unknown }): Promise<T> {
    const headers = new Headers();
    if (options.body !== undefined) {
      headers.set('Content-Type', 'application/json');
    }
    if (this.tokenProvider) {
      const token = await this.tokenProvider();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: options.method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      throw new Error(await parseError(response));
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    return text ? (JSON.parse(text) as T) : (undefined as T);
  }
}
