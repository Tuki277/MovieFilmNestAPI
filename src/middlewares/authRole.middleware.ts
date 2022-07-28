import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UserService } from '../user/user.service';
import { UserDocument } from '../user/schemas/user.schema';
import { Responses } from 'src/commons/response';

@Injectable()
export class AuthRoleMiddleware extends Responses implements NestMiddleware {
  constructor(private userService: UserService) {
    super();
  }
  async use(req: Request | any, res: Response, next: NextFunction) {
    const idUser = req.user;
    const userResult: UserDocument = await this.userService.filterUser({
      _id: idUser,
    });
    if (!userResult) {
      return this.error(res, HttpStatus.UNAUTHORIZED);
    } else {
      if (userResult.role === 1 || userResult.role === 2) {
        next();
        return;
      } else {
        return this.error(res, HttpStatus.FORBIDDEN);
      }
    }
  }
}
