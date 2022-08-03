import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { GetAccessTokenMiddleware } from './middlewares/getAccessToken.middleware';
import { AuthRoleMiddleware } from './middlewares/authRole.middleware';
import { MovieModule } from './movie/movie.module';
import { CategorymovieModule } from './categorymovie/categorymovie.module';
import { UserController } from './user/user.controller';
import { MulterModule } from '@nestjs/platform-express';
import { CategoryMovieController } from './categorymovie/categorymovie.controller';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URL),
    MulterModule.register({ dest: './uploads' }),
    UserModule,
    AuthModule,
    MovieModule,
    CategorymovieModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(GetAccessTokenMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
    consumer
      .apply(AuthRoleMiddleware)
      .exclude({ path: '/api/categories', method: RequestMethod.GET })
      .forRoutes(CategoryMovieController);
    consumer
      .apply(AuthRoleMiddleware)
      .exclude({ path: '/api/user/do=current-user', method: RequestMethod.GET })
      .forRoutes(UserController);
    consumer
      .apply(AuthRoleMiddleware)
      .forRoutes({ path: '/api/movie', method: RequestMethod.GET });
  }
}
