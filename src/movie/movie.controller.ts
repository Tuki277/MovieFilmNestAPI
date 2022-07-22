import {
  Controller,
  Delete,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MovieService } from './movie.service';
import { Movie, MovieDocument } from './schema/movie.schema';
import { idPrams } from './schema/movie.validate';
import { Request, Response } from 'express';
import { JsonResponse } from '../helpers';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { UserDocument } from '../user/schemas/user.schema';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { BuyMovie, MovieSwagger, SearchMovie } from '../swagger';
import { Responses } from 'src/commons/response';
import { DoCode, ResponseMessage } from 'src/commons/consts/response.const';
import { log } from 'src/commons/logger';
import { LevelLogger } from 'src/commons/consts/loger.const';

export interface IResponse extends Request {
  file: any;
  user: any;
}

@ApiTags('movie')
@Controller('api')
export class MovieController extends Responses {
  constructor(private movieService: MovieService) {
    super();
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Get('video/:id')
  async playVideoStream(@Req() req: Request, @Res() res: Response) {
    const { id } = req.params;
    const range = req.headers.range;
    try {
      const dataResult = await this.movieService.playVideoStream(id, range);
      const { start, end, headers, videoPath } = dataResult;
      res.writeHead(206, headers);
      const stream = fs.createReadStream(videoPath, { start, end });
      stream.pipe(res);
    } catch (error) {
      log(req, error.message, LevelLogger.ERROR);
      return this.error(res, error);
    }
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Get('movie/do=download/:id')
  async downloadFileReport(@Req() req: Request, @Res() res: Response) {
    try {
      const { id } = req.params;
      const movie: MovieDocument[] = await this.movieService.filterMovie({
        _id: id,
      });
      const fileName = movie[0].fileName;
      const directoryPath = movie[0].filmLocation;
      log(req, ResponseMessage.DOWNLOAD_SUCCESS, LevelLogger.INFO);
      res.download(directoryPath, fileName, (err) => {
        if (err) {
          return res.status(500).json(JsonResponse(true, err.message));
        }
      });
    } catch (error) {
      log(req, error.message, LevelLogger.ERROR);
      return this.error(res, error);
    }
  }

  @UseGuards(AuthGuard('auth'))
  @ApiBody({ type: BuyMovie })
  @Post('movie/do=buy')
  async buyMovie(@Req() req: Request, @Res() res: Response) {
    try {
      const userId = (req as IResponse).user._id;
      await this.movieService.buyMovie(req, userId);
      log(req, ResponseMessage.BUY_SUCCESS, LevelLogger.INFO);
      return this.responseJson(res, DoCode.BUY);
    } catch (error) {
      log(req, error.message, LevelLogger.ERROR);
      return this.error(res, error);
    }
  }

  @Get('movie/do=detail/:id')
  async getMovieById(@Req() req: Request, @Res() res: Response) {
    try {
      const { id } = req.params;
      const idUser = (req as IResponse).user;
      const movie = await this.movieService.getDetailMovie(id, idUser);
      return this.responseJson(res, DoCode.GET, movie);
    } catch (error) {
      log(req, error.message, LevelLogger.ERROR);
      return this.error(res, error);
    }
  }

  @Post('movie/do=search')
  @ApiBody({ type: SearchMovie })
  async filterMovie(@Req() req: Request, @Res() res: Response) {
    try {
      const movieResult = await this.movieService.searchMovie(req.body);
      return this.responseJson(res, DoCode.GET, movieResult);
    } catch (error) {
      log(req, error.message, LevelLogger.ERROR);
      return this.error(res, error);
    }
  }

  @ApiQuery({ name: 'rowPerPage', type: Number, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @Get('movie/do=all')
  async getAllMovieList(@Req() req: Request, @Res() res: Response) {
    try {
      const dataResult = await this.movieService.getMovie(req.query);
      log(req, ResponseMessage.OK, LevelLogger.INFO);
      return this.responseJson(res, DoCode.GET, dataResult);
    } catch (error) {
      log(req, error.message, LevelLogger.ERROR);
      this.error(res, error);
    }
  }

  @ApiBearerAuth('auth')
  @Get('movie/user')
  @UseGuards(AuthGuard('auth'))
  async getMovieByAccountId(@Req() req: Request, @Res() res: Response) {
    try {
      const userId: UserDocument = (req as IResponse).user;
      const data: Movie[] = await this.movieService.filterMovie({
        authorCreated: userId._id,
      });
      return this.responseJson(res, DoCode.GET, data);
    } catch (error) {
      log(req, error.message, LevelLogger.ERROR);
      return this.error(res, error);
    }
  }

  @ApiBearerAuth('auth')
  @ApiBody({ type: MovieSwagger })
  @ApiConsumes('multipart/form-data')
  @Post('movie/do=add')
  @UseGuards(AuthGuard('auth'))
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const filename = file.originalname;
          callback(null, filename);
        },
      }),
    }),
  )
  async createMovie(@Req() req: Request, @Res() res: Response) {
    try {
      const locationFileUpload = '../../Demo/demo-movie/uploads/';
      const renameFileUpload =
        locationFileUpload + (req as IResponse).file.originalname;
      const dataJson = JSON.parse(req.body.data);
      const userId = (req as IResponse).user._id;
      const reqFile = (req as IResponse).file;
      const categoryId = dataJson.categoryMovie;
      const dataAdd = await this.movieService.createMovie(
        dataJson,
        userId,
        renameFileUpload,
        reqFile,
        categoryId,
      );
      return this.responseJson(res, DoCode.CREATE, dataAdd);
    } catch (error) {
      log(req, error.message, LevelLogger.ERROR);
      return this.error(res, error);
    }
  }

  @ApiBearerAuth('auth')
  @ApiParam({ name: 'id', type: 'string' })
  @UseGuards(AuthGuard('auth'))
  @Delete('movie/do=delete/:id')
  async deleteMovie(@Req() req: Request, @Res() res: Response) {
    try {
      const user: UserDocument = (req as IResponse).user;
      const { id } = req.params;
      await idPrams.validateAsync({ id });
      await this.movieService.deleteMovieService(id, user);
      log(req, ResponseMessage.DELETED, LevelLogger.INFO);
      return this.responseJson(res, DoCode.DELETE);
    } catch (error) {
      log(req, error.message, LevelLogger.ERROR);
      return this.error(res, error);
    }
  }
}
