import { Injectable } from '@nestjs/common';
import { MulterOptionsFactory } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { GridFsStorage } from 'multer-gridfs-storage';

@Injectable()
export class GridMulterConfigService implements MulterOptionsFactory {
  gridFsStore;

  constructor() {
    this.gridFsStore = new GridFsStorage({
      url: process.env.MONGO_URL,
      file: (req, file) => {
        return new Promise((reslove, reject) => {
          const filename = file.originalname.trim();
          const fileInfo = {
            filename,
          };
          reslove(fileInfo);
        });
      },
    });
  }
  createMulterOptions(): MulterOptions | Promise<MulterOptions> {
    return {
      storage: this.gridFsStore,
    };
  }
}
