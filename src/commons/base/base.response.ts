import { Response } from 'express';
import {
  JsonResponse,
  processDoCode,
  processResponseMessage,
} from 'src/helpers';

export class BaseResponse {
  response = (
    res: Response,
    doCode: number,
    statusState: boolean,
    total?: number,
    data?: any,
    access_token?: string,
    refresh_token?: string,
  ) =>
    res
      .status(processDoCode(doCode))
      .json(
        JsonResponse(
          statusState,
          processResponseMessage(doCode),
          total,
          data,
          access_token,
          refresh_token,
        ),
      );

  responseError = (res, httpStatus, message) =>
    res.status(httpStatus).json(JsonResponse(true, message));
}
