import { IDoCode, IResponseMessage } from '../interface';

export const ResponseMessage: IResponseMessage = {
  NOT_FOUND: 'Not found',
  FORBIDDEN: 'Forbidden',
  OK: 'OK',
  UNKNOWN_ERROR: 'Unknown',
  CREATED: 'Created',
  UPDATED: 'Updated',
  DELETED: 'Deleted',
  QUERY_SUCCESS: 'Query success',
  BUY_SUCCESS: 'Buy success',
};

export const DoCode: IDoCode = {
  GET: 0,
  DELETE: 1,
  CREATE: 2,
  UPDATE: 3,
  NOT_FOUND: 4,
  BUY: 5,
};
