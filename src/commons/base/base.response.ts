import { JsonResponse } from 'src/helpers';

export class BaseResponse {
  response(
    res,
    code,
    statusState: boolean,
    message: string,
    data?: any,
    access_token?: string,
    refresh_token?: string,
  ) {
    return res
      .status(code)
      .json(
        JsonResponse(statusState, message, data, access_token, refresh_token),
      );
  }
}
