import {
  Controller,
  Res,
  Req,
  UseGuards,
  Post,
  Delete,
  Patch,
  Get,
  HttpStatus,
} from '@nestjs/common';
import { CategoryMovieService } from './categorymovie.service';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { CategoryMovie } from './schema/categorymovie.schema';
import {
  createCategorySchema,
  paramsId,
  updateCategorySchema,
} from './schema/categorymovie.validate';
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CategorySwagger } from 'src/swagger';
import { log } from 'src/commons/logger';
import { LevelLogger } from 'src/commons/consts/logger.const';
import { BaseResponse } from 'src/commons/base/base.response';

@ApiTags('category')
@Controller('categories')
export class CategoryMovieController extends BaseResponse {
  constructor(private categoryService: CategoryMovieService) {
    super();
  }

  @Get()
  @ApiQuery({ name: 'rowPerPage', type: Number, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  async getAllCategories(@Req() req: Request, @Res() res: Response) {
    try {
      const dataResult: CategoryMovie[] =
        await this.categoryService.getAllCategory(req.query);
      const total = await this.categoryService.getCountCategory();
      log(req, '=== OK ===', LevelLogger.INFO);
      return this.responseMessage(res, HttpStatus.OK, total, dataResult);
    } catch (error) {
      log(req, error.message, LevelLogger.ERROR);
      return this.responseError(res, error.status, error.message);
    }
  }

  @ApiBearerAuth('auth')
  @UseGuards(AuthGuard('auth'))
  @ApiBody({ type: CategorySwagger })
  @Post()
  async createCategory(@Req() req: Request, @Res() res: Response) {
    try {
      await createCategorySchema.validateAsync({
        ...req.body,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        userCreated: req.user._id.toString(),
      });
      await this.categoryService.createCategory({
        ...req.body,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        userCreated: req.user._id.toString(),
      });
      log(req, '=== Created ===', LevelLogger.INFO);
      return this.responseNoContent(res, HttpStatus.CREATED);
    } catch (error) {
      log(req, error.message, LevelLogger.ERROR);
      return this.responseError(res, error.status, error.message);
    }
  }

  @ApiBearerAuth('auth')
  @UseGuards(AuthGuard('auth'))
  @Delete(':id')
  @ApiParam({ name: 'id', type: 'string' })
  async deleteCategory(@Req() req: Request, @Res() res: Response) {
    try {
      const { id } = req.params;
      await paramsId.validateAsync({ id });
      await this.categoryService.deleteCategory(id);
      log(req, '=== Deleted ===', LevelLogger.INFO);
      return this.responseNoContent(res, HttpStatus.OK);
    } catch (error) {
      log(req, error.message, LevelLogger.ERROR);
      return this.responseError(res, error.status, error.message);
    }
  }

  @ApiBearerAuth('auth')
  @UseGuards(AuthGuard('auth'))
  @ApiBody({ type: CategorySwagger })
  @Patch(':id')
  @ApiParam({ name: 'id', type: 'string' })
  async updateCategory(@Req() req: Request, @Res() res: Response) {
    try {
      const { id } = req.params;
      const { body } = req;
      await updateCategorySchema.validateAsync(req);
      await this.categoryService.updateCategory({ _id: id }, body, {
        new: true,
      });
      log(req, '=== Updated ===', LevelLogger.INFO);
      return this.responseNoContent(res, HttpStatus.OK);
    } catch (error) {
      log(req, error.message, LevelLogger.ERROR);
      return this.responseError(res, error.status, error.message);
    }
  }
}
