export interface TErrrorSources {
  path: string;
  message: string;
}

export interface TErrorResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  errorSources?: TErrrorSources[];
  stack?: string;
  error?: unknown;
}
