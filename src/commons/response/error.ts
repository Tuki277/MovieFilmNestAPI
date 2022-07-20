export class ErrorResponse {
  errorRes(error: any) {
    throw new Error(error);
  }
}
