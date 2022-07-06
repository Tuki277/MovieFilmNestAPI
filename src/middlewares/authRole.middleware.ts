import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UserService } from '../user/user.service';
import { JsonResponse } from '../helpers';
import { UserDocument } from '../user/schemas/user.schema';

@Injectable()
export class AuthRoleMiddleware implements NestMiddleware {
  constructor(private userService: UserService) {}
  async use(req: Request | any, res: Response, next: NextFunction) {
    const idUser = req.user;
    const userResult: UserDocument = await this.userService.filterUser({
      _id: idUser,
    });
    if (!userResult) {
      return res.status(404).json(JsonResponse(true, 'not found'));
    } else {
      if (userResult.role === 1 || userResult.role === 2) {
        req.role = userResult.role;
        next();
        return;
      } else {
        return res.status(403).json(JsonResponse(false, 'forbidden'));
      }
    }
  }
}
