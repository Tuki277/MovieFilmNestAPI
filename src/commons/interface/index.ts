export interface IResponseMessage {
  NOT_FOUND: string;
  FORBIDDEN: string;
  OK: string;
  UNKNOWN_ERROR: string;
  CREATED: string;
  UPDATED: string;
  DELETED: string;
  QUERY_SUCCESS: string;
  BUY_SUCCESS: string;
  BUY_FAIL: string;
  DOWNLOAD_SUCCESS: string;
  UNAUTHORIZED: string;
}

export interface IDoCode {
  GET: number;
  DELETE: number;
  CREATE: number;
  UPDATE: number;
  NOT_FOUND: number;
  BUY: number;
}

export interface IPaging {
  page: number;
  rowPerPage: number;
}

export interface ILevel {
  ERROR: 'error';
  INFO: 'info';
  WARNING: 'warn';
}
