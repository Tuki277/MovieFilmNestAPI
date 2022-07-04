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
import { JsonResponse } from 'src/helpers';
import { AuthGuard } from '@nestjs/passport';
import { User, UserDocument } from './schemas/user.schema';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { UserSwagger } from 'src/swagger';

@ApiTags('user')
@Controller('api')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiBearerAuth('auth')
  @UseGuards(AuthGuard('auth'))
  @Get('user')
  async getAllUser(@Req() req: Request, @Res() res: Response) {
    try {
      const data: User[] = await this.userService.getAllUser();
      return res.status(200).json(JsonResponse(false, 'query success', data));
    } catch (e) {
      return res.status(500).json(JsonResponse(true, e.messages));
    }
  }

  @ApiBearerAuth('auth')
  @UseGuards(AuthGuard('auth'))
  @Get('current-user')
  async getCurrentUser(@Req() req: Request | any, @Res() res: Response) {
    try {
      const user: UserDocument = req.user;
      if (user.role === 1) {
        return res.status(200).json(
          JsonResponse(false, 'query success', {
            ...user,
            permission: true,
          }),
        );
      } else {
        return res.status(200).json(
          JsonResponse(false, 'query success', {
            ...user,
            permission: false,
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
  @Delete('user/:id')
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
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UserSwagger })
  @Put('user/:id')
  async putUser(@Req() req: Request, @Res() res: Response) {
    try {
      const id: string = req.params.id;
      const { body } = req;

      const dataResult: User = await this.userService.filterUser({ _id: id });

      if (dataResult) {
        const dataUpdate = await this.userService.updateUser(
          { _id: id },
          body,
          {
            new: true,
          },
        );
        return res.status(200).json(JsonResponse(false, 'updated', dataUpdate));
      }

      return res.status(200).json(JsonResponse(false, 'not found'));
    } catch (e) {
      return res.status(500).json(JsonResponse(false, e.messages));
    }
  }
}
