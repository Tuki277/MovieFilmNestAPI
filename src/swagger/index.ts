import { ApiProperty } from '@nestjs/swagger';
import { binary } from 'joi';

export class Login {
  @ApiProperty({ required: true })
  username: string;

  @ApiProperty({ required: true })
  password: string;
}

export class RefreshToken {
  @ApiProperty({ required: true })
  refreshToken: string;
}

export class Paging {
  @ApiProperty({ required: true })
  skip: number;

  @ApiProperty({ required: true })
  limit: number;
}

export class UserSwagger {
  @ApiProperty({ required: true })
  username: string;

  @ApiProperty({ required: true })
  password: string;

  @ApiProperty({ required: true })
  fullname: string;

  @ApiProperty({ required: true })
  age: number;

  @ApiProperty({ required: true })
  address: string;

  @ApiProperty({ required: false })
  role: number;
}

export class MovieSwagger {
  @ApiProperty({
    required: true,
    description:
      'ex: {"title": "Movie 2", "description": "description for movie 1", "categoryMovie": "62c314559ec8c509a481be40", "region": "VietNam", "status": 0 }',
  })
  data: string;

  @ApiProperty({
    required: true,
    format: 'binary',
  })
  file: string;
}

export class CategorySwagger {
  @ApiProperty({ required: true })
  title: string;
}
