import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { JsonResponse } from 'src/helpers';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { registerSchema, loginSchema } from '../user/schemas/user.vaidate';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Login, RefreshToken, UserSwagger } from 'src/swagger';
import { UserDocument } from 'src/user/schemas/user.schema';
import { AuthGuard } from '@nestjs/passport';
import { Responses } from 'src/commons/response';
import { DoCode, ResponseMessage } from 'src/commons/consts/response.const';
import { log } from 'src/commons/logger';
import { LevelLogger } from 'src/commons/consts/logger.const';

@ApiTags('auth')
@Controller('auth')
export class AuthController extends Responses {
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
        return res.status(200).json(JsonResponse(false, 'login fail'));
      }
      const user: UserDocument = await this.userService.filterUser({
        username: req.body.username,
      });
      const payload = { id: user._id, username: user.username };
      const refreshToken = this.jwtService.sign(payload, {
        expiresIn: process.env.EXPIRESIN_REFRESHTOKEN,
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
      return this.responseJson(res, DoCode.LOGIN, null, jwt, refreshToken);
    } catch (error) {
      log(req, error.message, LevelLogger.ERROR);
      return this.error(res, error);
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
      return res
        .status(404)
        .json(JsonResponse(false, ResponseMessage.NOT_FOUND));
    }

    try {
      await this.jwtService.verify(refreshToken);

      const payload = { id: user._id };
      const refreshTokenCreate = this.jwtService.sign(payload, {
        expiresIn: process.env.EXPIRESIN_REFRESHTOKEN,
      });

      await this.userService.updateUser(
        { _id: user._id },
        {
          ...user,
          refreshToken: refreshTokenCreate,
        },
      );
      return res.status(200).json({
        result: {
          error: false,
          message: 'refresh token',
          access_token: this.jwtService.sign(payload),
          refresh_token: refreshTokenCreate,
        },
      });
    } catch (error) {
      log(req, error.message, LevelLogger.ERROR);
      return res.status(403).json(JsonResponse(false, error));
    }
  }

  @ApiBody({ type: UserSwagger })
  @Post('register')
  async register(@Req() req: Request, @Res() res: Response) {
    try {
      await registerSchema.validateAsync(req.body);
      const check = await this.userService.checkUsernameDuplicated(req.body);
      if (check) {
        await this.userService.createUser(req.body);
        return this.responseJson(res, DoCode.CREATE);
      }
      return this.error(res, 'username is duplicated', true);
    } catch (error) {
      return this.error(res, error);
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
