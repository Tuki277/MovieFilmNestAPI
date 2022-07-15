import {
  Controller,
  Get,
  Res,
  Req,
  UseGuards,
  Post,
  Delete,
  Patch,
} from '@nestjs/common';
import { CategorymovieService } from './categorymovie.service';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { CategoryMovie } from './schema/categorymovie.schema';
import { JsonResponse } from 'src/helpers';
import {
  createCategorySchema,
  paramsId,
} from './schema/categorymovie.validate';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { CategorySwagger } from 'src/swagger';

@ApiTags('category')
@Controller('api')
export class CategorymovieController {
  constructor(private categoryService: CategorymovieService) {}

  @ApiBearerAuth('auth')
  @UseGuards(AuthGuard('auth'))
  @Get('categories/do=all')
  async getAllCategories(@Req() req: Request, @Res() res: Response) {
    try {
      const data: CategoryMovie[] = await this.categoryService.getAllCategory();
      return res.status(200).json(JsonResponse(false, 'query success', data));
    } catch (e) {
      return res.status(500).json(JsonResponse(false, e.message));
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
      return res.status(201).json(JsonResponse(false, 'created', category));
    } catch (e) {
      if (e.isJoi) {
        return res.status(422).json(JsonResponse(true, e.message));
      }
      return res.status(500).json(JsonResponse(true, e.message));
    }
  }

  // // @ApiBearerAuth('auth')
  // // @UseGuards(AuthGuard('auth'))
  // // @Delete('categories/do=delete/:id')
  // // @ApiParam({ name: 'id', type: 'string' })
  // // async deleteCategory(@Req() req: Request, @Res() res: Response) {
  // //   try {
  // //     const { id } = req.params;
  // //     await paramsId.validateAsync({ id });
  // //     await this.categoryService.deleteCategory(id);
  // //     return res.status(200).json(JsonResponse(false, 'deleted'));
  // //   } catch (e) {
  // //     if (e.isJoi) {
  // //       return res.status(422).json(JsonResponse(true, e.message));
  // //     }
  // //     return res.status(500).json(JsonResponse(true, e.message));
  // //   }
  // // }

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
      return res.status(200).json(JsonResponse(false, 'updated'));
    } catch (e) {
      if (e.isJoi) {
        return res.status(422).json(JsonResponse(true, e.message));
      }
      return res.status(500).json(JsonResponse(true, e.message));
    }
  }
}
