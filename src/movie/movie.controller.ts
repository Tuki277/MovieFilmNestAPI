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
  constructor(private movieService: MovieService) {}

  @ApiParam({ name: 'id', type: 'string' })
  @Get('video/:id')
  async playVideoStream(@Req() req: Request, @Res() res: Response) {
    const { id } = req.params;
    const range = req.headers.range;

    const dataResult = await this.movieService.playVideoStream(id, range);
    const { start, end, headers, videoPath } = dataResult;
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

  @UseGuards(AuthGuard('auth'))
  @Post('movie/do=buy')
  async buyMovie(@Req() req: Request, @Res() res: Response) {
    try {
      const userId = (req as IResponse).user._id;
      await this.movieService.buyMovie(req.body, userId);
      return res.status(200).json(JsonResponse(false, 'buy success'));
    } catch (error) {
      return res.status(500).json(JsonResponse(true, error.message));
    }
  }

  @Get('movie/do=detail/:id')
  async getMovieById(@Req() req: Request, @Res() res: Response) {
    try {
      const { id } = req.params;
      const idUser = (req as IResponse).user;
      const movie = await this.movieService.getDetailMovie(id, idUser);
      return res.status(200).json(JsonResponse(false, 'query success', movie));
    } catch (error) {
      return res.status(500).json(JsonResponse(false, error.message));
    }
  }

  @Post('movie/do=search')
  async filterMovie(@Req() req: Request, @Res() res: Response) {
    const movieResult = await this.movieService.searchMovie(req.body);
    return res
      .status(200)
      .json(JsonResponse(false, 'query success', movieResult));
  }

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
      return res.status(200).json(JsonResponse(false, 'created', dataAdd));
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
      await idPrams.validateAsync({ id });
      await this.movieService.deleteMovieService(id, user);
      return res.status(200).json(JsonResponse(false, 'deleted'));
    } catch (e) {
      if (e.isJoi) {
        return res.status(422).json(JsonResponse(true, e.message));
      }
      return res.status(500).json(JsonResponse(true, e.message));
    }
  }
}
