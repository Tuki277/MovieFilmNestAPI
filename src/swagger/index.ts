import { ApiProperty } from '@nestjs/swagger';

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
  @ApiProperty({ required: true })
  title: string;

  @ApiProperty({ required: true })
  content: string;

  @ApiProperty()
  categories: string;
}

export class CategorySwagger {
  @ApiProperty({ required: true })
  title: string;
}
