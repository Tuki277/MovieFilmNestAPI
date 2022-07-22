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
import { AuthGuard } from '@nestjs/passport';
import { User, UserDocument } from './schemas/user.schema';
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UserSwagger } from '../swagger';
import { Responses } from 'src/commons/response';
import { DoCode, ResponseMessage } from 'src/commons/consts/response.const';
import { LevelLogger } from 'src/commons/consts/loger.const';
import { log } from 'src/commons/logger';

export interface ReqUser extends Request {
  user: any;
}

@ApiTags('user')
@Controller('api')
export class UserController extends Responses {
  constructor(private userService: UserService) {
    super();
  }

  @ApiBearerAuth('auth')
  @UseGuards(AuthGuard('auth'))
  @ApiQuery({ name: 'rowPerPage', type: Number, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @Get('user/do=all')
  async getAllUser(@Req() req: Request, @Res() res: Response) {
    try {
      const data = await this.userService.getAllUser(
        (req as ReqUser).user.role,
        req.query,
      );
      log(req, ResponseMessage.OK, LevelLogger.INFO);
      return this.responseJson(res, DoCode.GET, data);
    } catch (error) {
      log(req, error.message, LevelLogger.ERROR);
      return this.error(res, error);
    }
  }

  @ApiBearerAuth('auth')
  @UseGuards(AuthGuard('auth'))
  @Get('user/do=current-user')
  async getCurrentUser(@Req() req: Request, @Res() res: Response) {
    try {
      const user: UserDocument = (req as ReqUser).user;
      if (user.role === 1 || user.role === 2) {
        return this.responseJson(res, DoCode.GET, {
          ...user,
          movieUpload: user.movie.length,
          permission: true,
        });
      } else {
        return this.responseJson(res, DoCode.GET, {
          ...user,
          movieUpload: user.movie.length,
          permission: true,
        });
      }
    } catch (error) {
      return this.error(res, error);
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
        return this.responseJson(res, DoCode.DELETE);
      }
      return this.responseJson(res, DoCode.NOT_FOUND);
    } catch (error) {
      return this.error(res, error);
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

      await this.userService.updateUser({ _id: id }, body);
      return this.responseJson(res, DoCode.UPDATE);
    } catch (error) {
      return this.error(res, error);
    }
  }
}
