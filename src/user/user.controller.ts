import {
  Controller,
  Get,
  Res,
  Req,
  Delete,
  Put,
  UseGuards,
  HttpStatus,
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
import { LevelLogger } from 'src/commons/consts/logger.const';
import { log } from 'src/commons/logger';
import { BaseResponse } from 'src/commons/base/base.response';
import { IPaging } from 'src/commons/interface';

export interface ReqUser extends Request {
  user: any;
}

@ApiTags('user')
@Controller('user')
export class UserController extends BaseResponse {
  constructor(private userService: UserService) {
    super();
  }

  @ApiBearerAuth('auth')
  @UseGuards(AuthGuard('auth'))
  @ApiQuery({ name: 'rowPerPage', type: Number, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @Get()
  async getAllUser(@Req() req: Request, @Res() res: Response) {
    try {
      const reqQuery: IPaging = {
        page: req.query.page ? parseInt(req.query.page.toString()) : null,
        rowPerPage: req.query.rowPerPage
          ? parseInt(req.query.rowPerPage.toString())
          : null,
      };
      const dataResult = await this.userService.getAllUser(
        (req as ReqUser).user.role,
        reqQuery,
      );
      const total = await this.userService.getCountUser();
      log(req, '=== OK ===', LevelLogger.INFO);
      return this.responseMessage(res, HttpStatus.OK, total, dataResult);
    } catch (error) {
      log(req, error.message, LevelLogger.ERROR);
      return this.responseError(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message,
      );
    }
  }

  @ApiBearerAuth('auth')
  @UseGuards(AuthGuard('auth'))
  @Get('current-user')
  async getCurrentUser(@Req() req: Request, @Res() res: Response) {
    try {
      let data = null;
      let dataRes = null;
      const total = 1;
      const user: UserDocument = (req as ReqUser).user;
      if (user.role === 1 || user.role === 2) {
        dataRes = {
          ...user,
          permission: true,
        };
        data = {
          dataRes,
          total,
        };
      } else {
        dataRes = {
          ...user,
          permission: false,
        };
        data = {
          dataRes,
          total,
        };
      }

      return this.responseMessage(res, HttpStatus.OK, total, dataRes);
    } catch (error) {
      return this.responseError(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message,
      );
    }
  }

  @ApiBearerAuth('auth')
  @UseGuards(AuthGuard('auth'))
  @ApiParam({ name: 'id', type: 'string' })
  @Delete(':id')
  async deleteUser(@Req() req: Request, @Res() res: Response) {
    try {
      const id: string = req.params.id;
      await this.userService.deleteUser(id);
      return this.responseNoContent(res, HttpStatus.OK);
    } catch (error) {
      return this.responseError(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message,
      );
    }
  }

  @ApiBearerAuth('auth')
  @UseGuards(AuthGuard('auth'))
  @ApiBody({ type: UserSwagger })
  @ApiParam({ name: 'id', type: 'string' })
  @Put(':id')
  async putUser(@Req() req: Request, @Res() res: Response) {
    try {
      const id: string = req.params.id;
      const body: UserDocument = req.body;

      await this.userService.updateUser({ _id: id }, body);
      return this.responseNoContent(res, HttpStatus.OK);
    } catch (error) {
      return this.responseError(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message,
      );
    }
  }
}
