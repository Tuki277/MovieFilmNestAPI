import {
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { registerValidate, loginSchema } from '../user/schemas/user.vaidate';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Login, RefreshToken, UserSwagger } from 'src/swagger';
import { UserDocument } from 'src/user/schemas/user.schema';
import { AuthGuard } from '@nestjs/passport';
import { log } from 'src/commons/logger';
import { LevelLogger } from 'src/commons/consts/logger.const';
import { BaseResponse } from 'src/commons/base/base.response';

@ApiTags('auth')
@Controller('auth')
export class AuthController extends BaseResponse {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    private userService: UserService,
  ) {
    super();
  }

  @ApiBody({ type: Login })
  @Post('login')
  async login(@Req() req: Request, @Res() res: Response) {
    try {
      await loginSchema.validateAsync(req.body);
      const checkLogin = await this.authService.validatePassword(
        req.body.password,
        req.body,
      );
      if (!checkLogin) {
        this.responseNoContent(res, HttpStatus.UNAUTHORIZED);
      }
      const user: UserDocument = await this.userService.filterUser({
        username: req.body.username,
      });
      const payload = { id: user._id, username: user.username };
      const refreshToken = this.jwtService.sign(payload, {
        expiresIn: process.env.EXPIRES_IN_REFRESH_TOKEN,
      });
      await this.userService.updateUser(
        { _id: user._id },
        {
          ...user,
          refreshToken: refreshToken,
        },
        true,
      );
      const jwt: string = this.jwtService.sign(payload);
      return this.responseMessage(
        res,
        HttpStatus.OK,
        null,
        null,
        jwt,
        refreshToken,
      );
    } catch (error) {
      log(req, error.message, LevelLogger.ERROR);
      return this.responseError(res, error.status, error.message);
    }
  }

  @Post('refresh-token')
  @ApiBody({ type: RefreshToken })
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const { refreshToken } = req.body;

    const user: UserDocument = await this.userService.filterUser({
      refreshToken,
    });

    if (!user) {
      this.responseNoContent(res, HttpStatus.NOT_FOUND);
    }

    try {
      await this.jwtService.verify(refreshToken);

      const payload = { id: user._id };
      const refreshTokenCreate = this.jwtService.sign(payload, {
        expiresIn: process.env.EXPIRES_IN_REFRESH_TOKEN,
      });

      await this.userService.updateUser(
        { _id: user._id },
        {
          ...user,
          refreshToken: refreshTokenCreate,
        },
        true,
      );
      this.responseMessage(
        res,
        HttpStatus.OK,
        null,
        null,
        this.jwtService.sign(payload),
        refreshTokenCreate,
      );
    } catch (error) {
      log(req, error.message, LevelLogger.ERROR);
      return this.responseError(res, error.status, error.message);
    }
  }

  @ApiBody({ type: UserSwagger })
  @Post('register')
  async register(@Req() req: Request, @Res() res: Response) {
    try {
      await registerValidate.validateAsync(req.body);
      const check = await this.userService.checkUsernameDuplicated(req.body);
      if (check) {
        await this.userService.createUser(req.body);
        return this.responseNoContent(res, HttpStatus.CREATED);
      }
      return this.responseError(
        res,
        HttpStatus.BAD_REQUEST,
        'username is duplicated',
      );
    } catch (error) {
      return this.responseError(res, HttpStatus.BAD_REQUEST, error.message);
    }
  }

  @UseGuards(AuthGuard('google'))
  @Get('login/oauth-google')
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async signInWithGoogle() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req) {
    return this.authService.signInWithGoogle(req);
  }
}
