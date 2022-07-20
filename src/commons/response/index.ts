import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { JsonResponse } from 'src/helpers';
import { BaseResponse } from '../base/base.response';
import { DoCode, ResponseMessage } from '../consts/response.const';

export class Responses extends BaseResponse {
  responseJson(res: Response, doCode: number, data?: any) {
    switch (doCode) {
      case DoCode.CREATE:
        return this.response(
          res,
          HttpStatus.CREATED,
          false,
          ResponseMessage.CREATED,
          data,
        );
      case DoCode.GET:
        return this.response(
          res,
          HttpStatus.OK,
          false,
          ResponseMessage.QUERY_SUCCESS,
          data,
        );
      case DoCode.UPDATE:
        return this.response(
          res,
          HttpStatus.OK,
          false,
          ResponseMessage.UPDATED,
        );
      case DoCode.DELETE:
        return this.response(
          res,
          HttpStatus.OK,
          false,
          ResponseMessage.DELETED,
        );
      case DoCode.NOT_FOUND:
        return this.response(
          res,
          HttpStatus.NOT_FOUND,
          false,
          ResponseMessage.NOT_FOUND,
        );
      case DoCode.BUY:
        return this.response(
          res,
          HttpStatus.OK,
          false,
          ResponseMessage.BUY_SUCCESS,
        );
      default:
        return this.response(
          res,
          HttpStatus.NOT_FOUND,
          true,
          ResponseMessage.NOT_FOUND,
        );
    }
  }

  error(res, error) {
    if (error && error.isJoi) {
      return this.response(
        res,
        HttpStatus.UNPROCESSABLE_ENTITY,
        true,
        error.message,
      );
    }
    return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(JsonResponse(true, error.message));
  }
}
