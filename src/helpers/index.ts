import { HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DoCode, ResponseMessage } from 'src/commons/consts/response.const';

export const hashPassword = async (password: string) => {
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.SALTWORKFACTOR));
    const hash = await bcrypt.hashSync(password, salt);
    return hash;
  } catch (error) {
    throw Error(error);
  }
};

export const processDoCode = (doCode: number): number => {
  return doCode === DoCode.GET || DoCode.UPDATE || DoCode.DELETE || DoCode.BUY
    ? HttpStatus.OK
    : doCode === DoCode.CREATE
    ? HttpStatus.CREATED
    : HttpStatus.NOT_FOUND;
};

export const processResponseMessage = (doCode: number): string => {
  switch (doCode) {
    case DoCode.CREATE:
      return ResponseMessage.CREATED;
    case DoCode.GET:
      return ResponseMessage.OK;
    case DoCode.UPDATE:
      return ResponseMessage.UPDATED;
    case DoCode.DELETE:
      return ResponseMessage.DELETED;
    case DoCode.NOT_FOUND:
      return ResponseMessage.NOT_FOUND;
    case DoCode.BUY:
      return ResponseMessage.BUY_SUCCESS;
  }
};

export const JsonResponse = (
  error: boolean,
  message: string,
  data?: any,
  accessToken?: string,
  refreshToken?: string,
) => {
  return {
    result: {
      error,
      message,
      data,
      accessToken,
      refreshToken,
    },
  };
};

export const getDateTimeNow = () => {
  const today = new Date();
  const date =
    today.getFullYear() + '/' + (today.getMonth() + 1) + '/' + today.getDate();
  const time =
    today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
  return `${date} - ${time}`;
};

export const confirmUserCreated = (idUser: string, idPrams: string) => {
  if (idUser === idPrams) {
    return true;
  }
  return false;
};
