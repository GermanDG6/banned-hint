import { HttpClient } from './http-client.port';
import { HttpClientException } from './http-client.exception';

export class FetchHttpClient implements HttpClient {
  async get<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new HttpClientException(`HTTP Error: ${response.statusText}`, response.status, url);
    }

    return await response.json();
  }

  async post<T>(url: string, body: unknown): Promise<T> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new HttpClientException(`HTTP Error: ${response.statusText}`, response.status, url);
    }

    return await response.json();
  }
}
