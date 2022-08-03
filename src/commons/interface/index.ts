import { Request } from 'express';

export interface IDoCode {
  GET: number;
  DELETE: number;
  CREATE: number;
  UPDATE: number;
  NOT_FOUND: number;
  BUY: number;
  LOGIN: number;
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

export interface IResponse extends Request {
  file: any;
  user: any;
}

export interface IGoogleOauth {
  sub: string;
  email: string;
}
