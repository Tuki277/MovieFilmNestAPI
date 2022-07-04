import { Test, TestingModule } from '@nestjs/testing';
import { CategorymovieController } from './categorymovie.controller';

describe('CategorymovieController', () => {
  let controller: CategorymovieController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategorymovieController],
    }).compile();

    controller = module.get<CategorymovieController>(CategorymovieController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
