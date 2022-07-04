import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriesSchema, Category } from './schema/categories.schema';
import { NewsService } from '../news/news.service';
import { News, NewsSchema } from '../news/schema/news.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategoriesSchema },
      { name: News.name, schema: NewsSchema },
    ]),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService, NewsService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
