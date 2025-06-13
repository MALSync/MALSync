import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import { logger } from './logger';

export class NotAutenticatedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotAutenticatedError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ServerOfflineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServerOfflineError';
  }
}

export class UnexpectedResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnexpectedResponseError';
  }
}

export interface HttpResponse {
  status: number;
  responseText: string;
  finalUrl: string;
}

export class HttpClient {
  private static instance: HttpClient;

  public static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient();
    }
    return HttpClient.instance;
  }

  public async xhr(method: string, options: {
    url: string;
    headers?: Record<string, string>;
    data?: string | Record<string, any>;
    timeout?: number;
  }): Promise<HttpResponse> {
    try {
      const config: AxiosRequestConfig = {
        method: method.toLowerCase() as any,
        url: options.url,
        headers: options.headers || {},
        timeout: options.timeout || 30000,
        validateStatus: () => true, // Don't throw on HTTP error status
      };

      if (options.data) {
        if (typeof options.data === 'string') {
          config.data = options.data;
        } else {
          config.data = options.data;
        }
      }

      const response: AxiosResponse = await axios(config);
      
      return {
        status: response.status,
        responseText: typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
        finalUrl: response.config.url || options.url
      };
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        throw new ServerOfflineError('Request timeout');
      }
      if (error.response) {
        return {
          status: error.response.status,
          responseText: typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data),
          finalUrl: error.response.config?.url || options.url
        };
      }
      throw new ServerOfflineError(`Network error: ${error.message}`);
    }
  }

  public async get(url: string, headers?: Record<string, string>): Promise<HttpResponse> {
    return this.xhr('GET', { url, headers });
  }

  public async post(url: string, data?: any, headers?: Record<string, string>): Promise<HttpResponse> {
    return this.xhr('POST', { url, data, headers });
  }

  public async put(url: string, data?: any, headers?: Record<string, string>): Promise<HttpResponse> {
    return this.xhr('PUT', { url, data, headers });
  }

  public async delete(url: string, headers?: Record<string, string>): Promise<HttpResponse> {
    return this.xhr('DELETE', { url, headers });
  }
}

export function parseJson(text: string): any {
  try {
    return JSON.parse(text);
  } catch (error) {
    logger.error('Failed to parse JSON:', error);
    throw new UnexpectedResponseError('Invalid JSON response');
  }
}

// Create a global instance for compatibility with existing code
export const httpClient = HttpClient.getInstance();
