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
}
