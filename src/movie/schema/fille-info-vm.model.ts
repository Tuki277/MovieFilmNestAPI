import { Prop } from '@nestjs/mongoose';

export class FileInfoVm {
  @Prop()
  length: number;

  @Prop()
  chunkSize: number;

  @Prop()
  filename: string;

  @Prop()
  md5: string;

  @Prop()
  contentType: string;
}
