import * as bcrypt from 'bcrypt';
import * as multer from 'multer';
import * as util from 'util';

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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../../Demo/demo-nest/filesave/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const uploadFile = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single('file');

export const uploadFileHelper = util.promisify(uploadFile);
