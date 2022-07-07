import {
  Controller,
  Get,
  Res,
  Req,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Request, Response } from 'express';
import { hashPassword, JsonResponse } from 'src/helpers';
import { AuthGuard } from '@nestjs/passport';
import { User, UserDocument } from './schemas/user.schema';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { UserSwagger } from 'src/swagger';

export interface ReqUser extends Request {
  user: any;
}

@ApiTags('user')
@Controller('api')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiBearerAuth('auth')
  @UseGuards(AuthGuard('auth'))
  @Get('user/do=all')
  async getAllUser(@Req() req: Request, @Res() res: Response) {
    try {
      const data: User[] = await this.userService.getAllUser(
        (req as ReqUser).user.role,
      );
      return res.status(200).json(JsonResponse(false, 'query success', data));
    } catch (e) {
      return res.status(500).json(JsonResponse(true, e.messages));
    }
  }

  @ApiBearerAuth('auth')
  @UseGuards(AuthGuard('auth'))
  @Get('user/current-user')
  async getCurrentUser(@Req() req: Request, @Res() res: Response) {
    try {
      const user: UserDocument = (req as ReqUser).user;
      if (user.role === 1 || user.role === 2) {
        return res.status(200).json(
          JsonResponse(false, 'query success', {
            ...user,
            movieUpload: user.movie.length,
            permission: true,
          }),
        );
      } else {
        return res.status(200).json(
          JsonResponse(false, 'query success', {
            ...user,
            movieUpload: user.movie.length,
            permission: true,
          }),
        );
      }
    } catch (e) {
      return res.status(500).json(JsonResponse(true, e.messages));
    }
  }

  @ApiBearerAuth('auth')
  @UseGuards(AuthGuard('auth'))
  @ApiParam({ name: 'id', type: 'string' })
  @Delete('user/do=delete/:id')
  async deleteUser(@Req() req: Request, @Res() res: Response) {
    try {
      const id: string = req.params.id;
      const dataResult: User = await this.userService.deleteUser(id);
      if (dataResult) {
        return res.status(200).json(JsonResponse(false, 'deleted'));
      }
      return res.status(200).json(JsonResponse(false, 'not found'));
    } catch (e) {
      return res.status(500).json(JsonResponse(true, e.messages));
    }
  }

  @ApiBearerAuth('auth')
  @UseGuards(AuthGuard('auth'))
  @ApiBody({ type: UserSwagger })
  @ApiParam({ name: 'id', type: 'string' })
  @Put('user/do=edit/:id')
  async putUser(@Req() req: Request, @Res() res: Response) {
    try {
      const id: string = req.params.id;
      const body: UserDocument = req.body;

      const dataResult: User = await this.userService.filterUser({ _id: id });

      if (dataResult) {
        if (body.username !== '') {
          const password = await hashPassword(req.body.password);
          const dataUpdateBody = {
            ...body,
            password,
          };
          const dataUpdate = await this.userService.updateUser(
            { _id: id },
            dataUpdateBody,
            {
              new: true,
            },
          );
          return res
            .status(200)
            .json(JsonResponse(false, 'updated', dataUpdate));
        } else {
          return res
            .status(422)
            .json(JsonResponse(false, 'field username is not update'));
        }
      }

      return res.status(200).json(JsonResponse(false, 'not found'));
    } catch (e) {
      return res.status(500).json(JsonResponse(false, e.messages));
    }
  }
}
