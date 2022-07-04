import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from '../categories/categories.service';
import { Request, Response } from 'express';
import { JsonResponse } from '../helpers';
import { NewsService } from './news.service';
import {
  createNewsSchema,
  getNewsByCategory,
  getNewsSchema,
  paramsId,
} from './schema/news.validate';
import { Category } from '../categories/schema/categories.schema';
import { News } from './schema/news.schema';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { NewsSwagger, Paging } from 'src/swagger';

@ApiTags('news')
@Controller('api')
export class NewsController {
  constructor(
    private categoryService: CategoriesService,
    private newsService: NewsService,
  ) {}

  @ApiBearerAuth('auth')
  @UseGuards(AuthGuard('auth'))
  @ApiBody({ type: Paging })
  @Post('news/getall')
  async getAllNews(@Req() req: Request, @Res() res: Response) {
    try {
      await getNewsSchema.validateAsync(req.body);
      const skip = req.body.skip;
      const limit = req.body.limit;
      const dataResult: News[] = await this.newsService.getAllNews(skip, limit);
      return res
        .status(200)
        .json(JsonResponse(false, 'Query success', dataResult));
    } catch (e) {
      if (e.isJoi) {
        return res.status(422).json(JsonResponse(true, e.message));
      }
      return res.status(500).json(JsonResponse(true, e.message));
    }
  }

  @ApiBearerAuth('auth')
  @UseGuards(AuthGuard('auth'))
  @Get('news-by-category')
  async getNewsByCategory(@Req() req: Request, @Res() res: Response) {
    try {
      const { body } = req;
      const categoryObjectID = await this.newsService.convertStringToObjectId(
        body.categories,
      );
      await getNewsByCategory.validateAsync(body);
      const data = await this.newsService.filterNews({
        categories: categoryObjectID,
      });
      return res.status(200).json(JsonResponse(false, 'query success', data));
    } catch (e) {
      if (e.isJoi) {
        return res.status(422).json(JsonResponse(true, e.message));
      }
      return res.status(500).json(JsonResponse(true, e.message));
    }
  }

  @ApiBearerAuth('auth')
  @ApiParam({ name: 'id', type: 'string' })
  @UseGuards(AuthGuard('auth'))
  @Get('news/:id')
  async getNewsById(@Req() req: Request, @Res() res: Response) {
    try {
      const { id } = req.params;
      await paramsId.validateAsync({ id });
      const dataResult = await this.newsService.filterNews({ _id: id });
      return res
        .status(200)
        .json(JsonResponse(false, 'query success', dataResult));
    } catch (e) {
      if (e.isJoi) {
        return res.status(422).json(JsonResponse(false, e.message));
      }
      return res.status(500).json(JsonResponse(true, e.message));
    }
  }

  @ApiBearerAuth('auth')
  @ApiBody({ type: NewsSwagger })
  @UseGuards(AuthGuard('auth'))
  @Post('news')
  async createNews(@Req() req: Request, @Res() res: Response) {
    try {
      await createNewsSchema.validateAsync({
        ...req.body,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        author: req.user._id.toString(),
      });

      const newsCreated: News = await this.newsService.createNews({
        ...req.body,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        author: req.user._id.toString(),
      });

      const categoryID = req.body.categories;
      const Category: Category = await this.categoryService.filterCategory({
        _id: categoryID,
      });

      if (Category) {
        Category.news.push(newsCreated);
        await this.categoryService.updateCategory(
          { _id: categoryID },
          Category,
          { new: true },
        );
        return res.status(201).json(
          JsonResponse(false, 'created', {
            newsCreated,
            Category,
          }),
        );
      } else {
        return res.status(500).json(JsonResponse(true, 'error created'));
      }
    } catch (e) {
      if (e.isJoi) {
        return res.status(422).json(JsonResponse(true, e.message));
      }
      return res.status(500).json(JsonResponse(true, e.message));
    }
  }

  @UseGuards(AuthGuard('auth'))
  @ApiBearerAuth('auth')
  @ApiParam({ name: 'id', type: 'string' })
  @Delete('news/:id')
  async deleteNews(@Req() req: Request, @Res() res: Response) {
    try {
      const id = req.params.id;
      await paramsId.validateAsync({ id });
      await this.newsService.deleteNews(id);
      return res.status(200).json(JsonResponse(false, 'deleted'));
    } catch (e) {
      if (e.isJoi) {
        return res.status(422).json(JsonResponse(true, e.message));
      }
      return res.status(500).json(JsonResponse(true, e.message));
    }
  }

  @ApiBearerAuth('auth')
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: NewsSwagger })
  @UseGuards(AuthGuard('auth'))
  @Put('news/:id')
  async updateNews(@Req() req: Request, @Res() res: Response) {
    try {
      const { id } = req.params;
      const { body } = req;
      await this.newsService.updateNews({ _id: id }, body, { new: true });
      return res.status(200).json(JsonResponse(false, 'updated'));
    } catch (e) {
      res.status(500).json(JsonResponse(true, e.message));
    }
  }
}
