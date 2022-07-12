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
import { createMovieSchema, idPrams } from './schema/movie.validate';
import { Request, Response } from 'express';
import { CategoryMovie } from '../categorymovie/schema/categorymovie.schema';
import { CategorymovieService } from '../categorymovie/categorymovie.service';
import { confirmUserCreated, getDateTimeNow, JsonResponse } from '../helpers';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { User, UserDocument } from '../user/schemas/user.schema';
import { UserService } from '../user/user.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { MovieSwagger } from '../swagger';

export interface IResponse extends Request {
  file: any;
  user: any;
}

@ApiTags('movie')
@Controller('api')
export class MovieController {
  constructor(
    private movieService: MovieService,
    private categoryService: CategorymovieService,
    private userService: UserService,
  ) {}

  @ApiParam({ name: 'id', type: 'string' })
  @Get('video/:id')
  async playVideoStream(@Req() req: Request, @Res() res: Response) {
    const { id } = req.params;
    const range = req.headers.range;

    const dataResult: MovieDocument[] = await this.movieService.filterMovie({
      _id: id,
    });
    const videoPath = dataResult[0].filmLocation;
    const videoSize = fs.statSync(videoPath).size;

    const chunkSize = 1 * 1e6;
    const start = Number(range.replace(/\D/g, ''));
    const end = Math.min(start + chunkSize, videoSize - 1);

    const contentLength = end - start + 1;

    const headers = {
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(206, headers);

    const stream = fs.createReadStream(videoPath, { start, end });
    stream.pipe(res);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Get('movie/do=download/:id')
  async downloadFileReport(@Req() req: Request, @Res() res: Response) {
    const { id } = req.params;
    const movie: MovieDocument[] = await this.movieService.filterMovie({
      _id: id,
    });
    const fileName = movie[0].fileName;
    const directoryPath = movie[0].filmLocation;
    res.download(directoryPath, fileName, (err) => {
      if (err) {
        return res.status(500).json(JsonResponse(true, err.message));
      }
    });
  }

  // @UseGuards(AuthGuard('google'))
  @UseGuards(AuthGuard('auth'))
  @Get('movie/do=all')
  async getAllMovieList(@Req() req: Request, @Res() res: Response) {
    try {
      const dataResult = await this.movieService.getMovie();
      return res
        .status(200)
        .json(JsonResponse(false, 'query success', dataResult));
    } catch (error) {
      return res.status(500).json(JsonResponse(true, error.message));
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
      return res.status(200).json(JsonResponse(false, 'query success', data));
    } catch (error) {
      if (error.isJoi) {
        return res.status(422).json(JsonResponse(true, error.message));
      }
      return res.status(500).json(JsonResponse(true, error.message));
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
    const locationFileUpload = '../../Demo/demo-movie/uploads/';
    const renameFileUpload =
      locationFileUpload + (req as IResponse).file.originalname;
    const dataJson = JSON.parse(req.body.data);

    try {
      await createMovieSchema.validateAsync({
        ...dataJson,
        authorCreated: (req as IResponse).user._id.toString(),
        filmLocation: renameFileUpload,
        fileName: (req as IResponse).file.originalname,
      });
      if ((req as IResponse).file == undefined) {
        return res
          .status(400)
          .json(JsonResponse(true, 'File upload not empty'));
      }
      const movieCreated: Movie = await this.movieService.createMovie({
        ...dataJson,
        authorCreated: (req as IResponse).user._id.toString(),
        filmLocation: renameFileUpload,
        fileName: getDateTimeNow() + (req as IResponse).file.originalname,
      });
      const categoryId = dataJson.categoryMovie;
      const category: CategoryMovie = await this.categoryService.filterCategory(
        {
          _id: categoryId,
        },
      );
      const userId = (req as IResponse).user._id;
      const user: User = await this.userService.filterUser({ _id: userId });
      user.movie.push(movieCreated);
      await this.userService.updateUser({ _id: userId }, user, {
        new: true,
      });
      if (category) {
        category.movie.push(movieCreated);
        await this.categoryService.updateCategory(
          { _id: categoryId },
          category,
          {
            new: true,
          },
        );
      }
      return res
        .status(200)
        .json(JsonResponse(false, 'created', { movieCreated, category }));
    } catch (error) {
      if (error.isJoi) {
        return res.status(422).json(JsonResponse(true, error.message));
      }
      return res.status(500).json(JsonResponse(true, error.message));
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
      const movieFilter: MovieDocument[] = await this.movieService.filterMovie({
        _id: id,
      });
      if (movieFilter.length > 0) {
        if (user.role === 3) {
          if (
            confirmUserCreated(
              user._id.toString(),
              movieFilter[0].authorCreated.toString(),
            )
          ) {
            await idPrams.validateAsync({ id });
            await this.movieService.deleteMovie(id);
            return res.status(200).json(JsonResponse(false, 'deleted'));
          }
          return res.status(403).json(JsonResponse(false, 'forbidden'));
        }
        await idPrams.validateAsync({ id });
        await this.movieService.deleteMovie(id);
        return res.status(200).json(JsonResponse(false, 'deleted'));
      }
      return res.status(404).json(JsonResponse(false, 'not found'));
    } catch (e) {
      if (e.isJoi) {
        return res.status(422).json(JsonResponse(true, e.message));
      }
      return res.status(500).json(JsonResponse(true, e.message));
    }
  }
}
