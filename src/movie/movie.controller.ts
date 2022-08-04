import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MovieService } from './movie.service';
import { Movie, MovieDocument } from './schema/movie.schema';
import { buyMovieSchema, idPrams } from './schema/movie.validate';
import { Request, Response } from 'express';
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
import { log } from 'src/commons/logger';
import { LevelLogger } from 'src/commons/consts/logger.const';
import { IResponse } from 'src/commons/interface';
import { v4 as uuidv4 } from 'uuid';
import { BaseResponse } from 'src/commons/base/base.response';

@ApiTags('movie')
@Controller('movie')
export class MovieController extends BaseResponse {
  constructor(private movieService: MovieService) {
    super();
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Get('watch/:id')
  async playVideoStream(@Req() req: Request, @Res() res: Response) {
    try {
      const { id } = req.params;
      const { range } = req.headers;
      await idPrams.validateAsync({ id });
      const dataResult = await this.movieService.playVideoStream(id, range);
      const { start, end, headers, videoPath } = dataResult;
      res.writeHead(206, headers);
      const stream = fs.createReadStream(videoPath, { start, end });
      stream.pipe(res);
    } catch (error) {
      log(req, error.message, LevelLogger.ERROR);
      return this.responseError(res, HttpStatus.BAD_REQUEST, error.message);
    }
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Get('download/:id')
  async downloadFileReport(@Req() req: Request, @Res() res: Response) {
    try {
      const { id } = req.params;
      await idPrams.validateAsync({ id });
      const movie: MovieDocument[] = await this.movieService.filterMovie({
        _id: id,
      });
      const fileName = movie[0].fileName;
      const directoryPath = movie[0].filmLocation;
      log(req, '=== Download ok ===', LevelLogger.INFO);
      return res.download(directoryPath, fileName, (err) => {
        if (err) {
          return res.status(500).send(err.message);
        }
      });
    } catch (error) {
      log(req, error.message, LevelLogger.ERROR);
      return this.responseError(res, HttpStatus.BAD_REQUEST, error.message);
    }
  }

  @UseGuards(AuthGuard('auth'))
  @ApiBody({ type: BuyMovie })
  @Post('buy')
  async buyMovie(@Req() req: Request, @Res() res: Response) {
    try {
      const userId = (req as IResponse).user._id;
      await buyMovieSchema.validateAsync(req.body);
      await this.movieService.buyMovie(req, userId);
      log(req, '=== Buy success ===', LevelLogger.INFO);
      return this.responseNoContent(res, HttpStatus.OK);
    } catch (error) {
      log(req, error.message, LevelLogger.ERROR);
      return this.responseError(res, HttpStatus.BAD_REQUEST, error.message);
    }
  }

  @Get(':id')
  async getMovieById(@Req() req: Request, @Res() res: Response) {
    try {
      const { id } = req.params;
      await idPrams.validateAsync({ id });
      const idUser = (req as IResponse).user;
      const movie = await this.movieService.getDetailMovie(id, idUser);
      return this.responseMessage(res, HttpStatus.OK, 1, {
        ...movie[0],
        watch: movie.watch,
      });
    } catch (error) {
      log(req, error.message, LevelLogger.ERROR);
      return this.responseError(res, HttpStatus.BAD_REQUEST, error.message);
    }
  }

  @Post('search')
  @ApiBody({ type: SearchMovie })
  async filterMovie(@Req() req: Request, @Res() res: Response) {
    try {
      const movieResult = await this.movieService.searchMovie(req.body);
      const total = await this.movieService.getAllMovie();
      return this.responseMessage(res, HttpStatus.OK, total, movieResult);
    } catch (error) {
      log(req, error.message, LevelLogger.ERROR);
      return this.responseError(res, HttpStatus.BAD_REQUEST, error.message);
    }
  }

  @ApiQuery({ name: 'rowPerPage', type: Number, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @Get()
  async getAllMovieList(@Req() req: Request, @Res() res: Response) {
    try {
      const dataResult = await this.movieService.getMovie(req.query);
      const total = await this.movieService.getAllMovie();
      log(req, '=== OK ===', LevelLogger.INFO);
      return this.responseMessage(res, HttpStatus.OK, total, dataResult);
    } catch (error) {
      log(req, error.message, LevelLogger.ERROR);
      this.responseError(res, HttpStatus.BAD_REQUEST, error.message);
    }
  }

  @ApiBearerAuth('auth')
  @Post('user')
  @UseGuards(AuthGuard('auth'))
  async getMovieByAccountId(@Req() req: Request, @Res() res: Response) {
    try {
      const userId: UserDocument = (req as IResponse).user;
      const dataRes: Movie[] = await this.movieService.filterMovie({
        authorCreated: userId._id,
      });
      return this.responseMessage(res, HttpStatus.OK, 1, dataRes);
    } catch (error) {
      log(req, error.message, LevelLogger.ERROR);
      return this.responseError(res, HttpStatus.BAD_REQUEST, error.message);
    }
  }

  @ApiBearerAuth('auth')
  @ApiBody({ type: MovieSwagger })
  @ApiConsumes('multipart/form-data')
  @Post()
  @UseGuards(AuthGuard('auth'))
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const idFile = uuidv4();
          const filename = idFile + file.originalname;
          callback(null, filename);
        },
      }),
    }),
  )
  async createMovie(@Req() req: Request, @Res() res: Response) {
    try {
      const locationFileUpload: string = process.env.PATH_SAVE_DB;
      const renameFileUpload: string =
        locationFileUpload + (req as IResponse).file.path;
      const dataJson = JSON.parse(req.body.data);
      const userId = (req as IResponse).user._id;
      const reqFile = (req as IResponse).file.path;
      const categoryId = dataJson.categoryMovie;
      await this.movieService.createMovie(
        dataJson,
        userId,
        renameFileUpload,
        reqFile,
        categoryId,
      );
      return this.responseNoContent(res, HttpStatus.CREATED);
    } catch (error) {
      log(req, error.message, LevelLogger.ERROR);
      return this.responseError(res, HttpStatus.BAD_REQUEST, error);
    }
  }

  @ApiBearerAuth('auth')
  @ApiParam({ name: 'id', type: 'string' })
  @UseGuards(AuthGuard('auth'))
  @Delete(':id')
  async deleteMovie(@Req() req: Request, @Res() res: Response) {
    try {
      const user: UserDocument = (req as IResponse).user;
      const { id } = req.params;
      await idPrams.validateAsync({ id });
      await this.movieService.deleteMovieService(id, user);
      log(req, '=== Deleted ===', LevelLogger.INFO);
      return this.responseNoContent(res, HttpStatus.OK);
    } catch (error) {
      log(req, error.message, LevelLogger.ERROR);
      return this.responseError(res, HttpStatus.BAD_REQUEST, error.message);
    }
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Patch(':id')
  async updateViews(@Req() req: Request, @Res() res: Response) {
    try {
      const { id } = req.params;
      await this.movieService.updateMovieService(id);
      return this.responseNoContent(res, HttpStatus.OK);
    } catch (error) {
      return this.responseError(res, HttpStatus.BAD_REQUEST, error.message);
    }
  }
}
