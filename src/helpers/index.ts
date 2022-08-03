import * as bcrypt from 'bcrypt';

export const hashPassword = async (password: string) => {
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.SALT_WORK_FACTOR));
    const hash = await bcrypt.hashSync(password, salt);
    return hash;
  } catch (error) {
    throw Error(error);
  }
};

export const JsonResponse = <T>(
  total?: number,
  result?: T,
  accessToken?: string,
  refreshToken?: string,
) => {
  return {
    total,
    result,
    accessToken,
    refreshToken,
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

export function cleanObject(obj: any) {
  for (const key in obj) {
    if (obj[key] === null) {
      delete obj[key];
    }
  }

  return obj;
}
