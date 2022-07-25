import {
  Controller,
  Res,
  Req,
  UseGuards,
  Post,
  Delete,
  Patch,
  Get,
} from '@nestjs/common';
import { CategorymovieService } from './categorymovie.service';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { CategoryMovie } from './schema/categorymovie.schema';
import {
  createCategorySchema,
  paramsId,
} from './schema/categorymovie.validate';
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CategorySwagger } from 'src/swagger';
import { Responses } from 'src/commons/response';
import { DoCode, ResponseMessage } from 'src/commons/consts/response.const';
import { log } from 'src/commons/logger';
import { LevelLogger } from 'src/commons/consts/loger.const';

@ApiTags('category')
@Controller('api')
export class CategorymovieController extends Responses {
  constructor(private categoryService: CategorymovieService) {
    super();
  }

  @Get('categories/do=all')
  @ApiQuery({ name: 'rowPerPage', type: Number, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  async getAllCategories(@Req() req: Request, @Res() res: Response) {
    try {
      const dataRes: CategoryMovie[] =
        await this.categoryService.getAllCategory(req.query);
      const total = await this.categoryService.getCountCategory();
      const data = {
        dataRes,
        total,
      };
      log(req, ResponseMessage.QUERY_SUCCESS, LevelLogger.INFO);
      return this.responseJson(res, DoCode.GET, data);
    } catch (error) {
      log(req, error.message, LevelLogger.ERROR);
      return this.error(res, error);
    }
  }

  @ApiBearerAuth('auth')
  @UseGuards(AuthGuard('auth'))
  @ApiBody({ type: CategorySwagger })
  @Post('categories/do=add')
  async createCategory(@Req() req: Request, @Res() res: Response) {
    try {
      await createCategorySchema.validateAsync({
        ...req.body,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        userCreated: req.user._id.toString(),
      });
      const category = await this.categoryService.createCategory({
        ...req.body,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        userCreated: req.user._id.toString(),
      });
      log(req, ResponseMessage.CREATED, LevelLogger.INFO);
      return this.responseJson(res, DoCode.CREATE, category);
    } catch (error) {
      log(req, error.message, LevelLogger.ERROR);
      return this.error(res, error);
    }
  }

  @ApiBearerAuth('auth')
  @UseGuards(AuthGuard('auth'))
  @Delete('categories/do=delete/:id')
  @ApiParam({ name: 'id', type: 'string' })
  async deleteCategory(@Req() req: Request, @Res() res: Response) {
    try {
      const { id } = req.params;
      await paramsId.validateAsync({ id });
      await this.categoryService.deleteCategory(id);
      log(req, ResponseMessage.DELETED, LevelLogger.INFO);
      return this.responseJson(res, DoCode.DELETE);
    } catch (error) {
      log(req, error.message, LevelLogger.ERROR);
      return this.error(res, error);
    }
  }

  @ApiBearerAuth('auth')
  @UseGuards(AuthGuard('auth'))
  @ApiBody({ type: CategorySwagger })
  @Patch('categories/do=edit/:id')
  @ApiParam({ name: 'id', type: 'string' })
  async updateCategory(@Req() req: Request, @Res() res: Response) {
    try {
      const { id } = req.params;
      const { body } = req;
      await paramsId.validateAsync({ id });
      await this.categoryService.updateCategory({ _id: id }, body, {
        new: true,
      });
      log(req, ResponseMessage.UPDATED, LevelLogger.INFO);
      return this.responseJson(res, DoCode.UPDATE);
    } catch (error) {
      log(req, error.message, LevelLogger.ERROR);
      return this.error(res, error);
    }
  }
}
