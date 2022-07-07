import * as bcrypt from 'bcrypt';
import { idPrams } from 'src/movie/schema/movie.validate';

export const hashPassword = async (password: string) => {
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.SALTWORKFACTOR));
    const hash = await bcrypt.hashSync(password, salt);
    return hash;
  } catch (error) {
    throw Error(error);
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
    today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  const time =
    today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
  return `${date}_${time}`;
};

export const confirmUserCreated = (idUser: string, idPrams: string) => {
  if (idUser === idPrams) {
    return true;
  }
  return false;
};
