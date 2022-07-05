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
import { Movie } from './schema/movie.schema';
import { createMovieSchema, idPrams } from './schema/movie.validate';
import { Request, Response } from 'express';
import { CategoryMovie } from 'src/categorymovie/schema/categorymovie.schema';
import { CategorymovieService } from 'src/categorymovie/categorymovie.service';
import { getDateTimeNow, JsonResponse } from 'src/helpers';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';

export interface IResponse extends Request {
  file: any;
  user: any;
}

@Controller('api')
export class MovieController {
  constructor(
    private movieService: MovieService,
    private categoryService: CategorymovieService,
  ) {}

  @Get('video/:id')
  async playVideoStream(@Req() req: Request, @Res() res: Response) {
    const { id } = req.params;
    const range = req.headers.range;

    const dataResult = await this.movieService.filterMovie(id);
    const videoPath = dataResult.filmLocation;
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

  @Get('movie')
  @UseGuards(AuthGuard('auth'))
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

  @Post('movie')
  @UseGuards(AuthGuard('auth'))
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const filename = getDateTimeNow() + file.originalname;
          callback(null, filename);
        },
      }),
    }),
  )
  async createMovie(@Req() req: Request, @Res() res: Response) {
    const locationFileUpload = '../../Demo/demo-movie/uploads/';
    const renameFileUpload =
      locationFileUpload +
      getDateTimeNow() +
      (req as IResponse).file.originalname;
    const dataJson = JSON.parse(req.body.data);

    try {
      await createMovieSchema.validateAsync({
        ...dataJson,
        authorCreated: (req as IResponse).user._id.toString(),
        filmLocation: renameFileUpload,
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
      });
      const categoryId = dataJson.categoryMovie;
      const category: CategoryMovie = await this.categoryService.filterCategory(
        {
          _id: categoryId,
        },
      );
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

  @UseGuards(AuthGuard('auth'))
  @Delete('movie/:id')
  async deleteMovie(@Req() req: Request, @Res() res: Response) {
    try {
      const id = req.params.id;
      await idPrams.validateAsync({ id });
      await this.movieService.deleteMovie(id);
      return res.status(200).json(JsonResponse(false, 'deleted'));
    } catch (e) {
      if (e.isJoi) {
        return res.status(422).json(JsonResponse(true, e.message));
      }
      return res.status(500).json(JsonResponse(true, e.message));
    }
  }
}
