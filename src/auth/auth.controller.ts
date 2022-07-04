import { Controller, Post, Req, Res } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { hashPassword, JsonResponse } from 'src/helpers';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { registerSchema, loginSchema } from '../user/schemas/user.vaidate';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Login, RefreshToken, UserSwagger } from 'src/swagger';
import { User, UserDocument } from 'src/user/schemas/user.schema';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    private userService: UserService,
  ) {}

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
        { new: true },
      );
      const jwt = this.jwtService.sign(payload);
      return res
        .status(200)
        .json(JsonResponse(false, 'Login Success', jwt, refreshToken));
    } catch (e) {
      if (e.isJoi) {
        return res.status(422).json(JsonResponse(true, e.message));
      }
    }
  }

  @Post('refresh-token')
  @ApiBody({ type: RefreshToken })
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.body.refreshToken;

    const user: UserDocument = await this.userService.filterUser({
      refreshToken: refreshToken,
    });

    if (!user) {
      return res.status(404).json(JsonResponse(false, 'not found'));
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
        { new: true },
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
      return res.status(403).json(JsonResponse(false, error));
    }
  }

  @ApiBody({ type: UserSwagger })
  @Post('register')
  async register(@Req() req: Request, @Res() res: Response) {
    try {
      await registerSchema.validateAsync(req.body);
      const password = await hashPassword(req.body.password);
      const username = await this.userService.filterUser({
        username: req.body.username,
      });

      if (username) {
        return res
          .status(401)
          .json(JsonResponse(false, 'Username is duplicated'));
      }
      const userCreate: User = await this.userService.createUser({
        ...req.body,
        password: password,
      });

      return res.status(201).json(JsonResponse(false, 'created', userCreate));
    } catch (e) {
      if (e.isJoi) {
        return res.status(422).json(JsonResponse(true, e.message));
      }
    }
  }
}
