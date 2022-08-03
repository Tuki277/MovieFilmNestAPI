import { HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { cleanObject, JsonResponse } from 'src/helpers';

export class BaseResponse {
  responseNoContent = (res: Response, statusCode: HttpStatus) =>
    res.status(statusCode).send();

  responseError = (res: Response, statusCode: HttpStatus, error: any) =>
    res.status(statusCode).send(error);

  responseMessage = <T>(
    res: Response,
    statusCode: HttpStatus,
    total?: number | null,
    data?: T | null,
    access_token?: string | null,
    refresh_token?: string | null,
  ) =>
    res
      .status(statusCode)
      .json(
        cleanObject(JsonResponse(total, data, access_token, refresh_token)),
      );

  throwError = (error: any, statusCode: HttpStatus) => {
    throw new HttpException(error, statusCode);
  };
}
