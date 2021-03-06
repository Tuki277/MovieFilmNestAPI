import { IDoCode, IResponseMessage } from '../interface';

export const ResponseMessage: IResponseMessage = {
  NOT_FOUND: 'Not found',
  FORBIDDEN: 'Forbidden',
  UNAUTHORIZED: 'Unauthorized',
  OK: 'OK',
  UNKNOWN_ERROR: 'Unknown',
  CREATED: 'Created',
  UPDATED: 'Updated',
  DELETED: 'Deleted',
  QUERY_SUCCESS: 'Query success',
  BUY_SUCCESS: 'Buy success',
  BUY_FAIL: 'Buy fail',
  DOWNLOAD_SUCCESS: 'Download success',
  LOGIN_FAIL: 'Login fail',
  LOGIN_SUCCESS: 'Login success',
};

export const DoCode: IDoCode = {
  GET: 0,
  DELETE: 1,
  CREATE: 2,
  UPDATE: 3,
  NOT_FOUND: 4,
  BUY: 5,
  LOGIN: 6,
};
