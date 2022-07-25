import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { BaseResponse } from '../base/base.response';
import { DoCode, ResponseMessage } from '../consts/response.const';

export class Responses extends BaseResponse {
  responseJson(
    res: Response,
    doCode: number,
    data?: any,
    token?: string,
    rf_token?: string,
  ) {
    if (doCode === DoCode.GET) {
      return this.response(res, doCode, false, data.total, data.dataRes);
    } else if (doCode === DoCode.CREATE) {
      return this.response(res, doCode, false, null, data);
    } else if (doCode === DoCode.LOGIN) {
      return this.response(res, doCode, false, null, null, token, rf_token);
    } else {
      return this.response(res, doCode, false);
    }
  }

  error(res, error) {
    if (error && error.isJoi) {
      return this.responseError(
        res,
        HttpStatus.UNPROCESSABLE_ENTITY,
        error.message,
      );
    }
    if (error && error === HttpStatus.UNAUTHORIZED) {
      return this.responseError(
        res,
        HttpStatus.UNAUTHORIZED,
        ResponseMessage.UNAUTHORIZED,
      );
    }
    if (error && error === HttpStatus.FORBIDDEN) {
      return this.responseError(
        res,
        HttpStatus.FORBIDDEN,
        ResponseMessage.FORBIDDEN,
      );
    }
    return this.responseError(
      res,
      HttpStatus.INTERNAL_SERVER_ERROR,
      error.message,
    );
  }
}
