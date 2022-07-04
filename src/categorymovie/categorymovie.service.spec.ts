import { Test, TestingModule } from '@nestjs/testing';
import { CategorymovieService } from './categorymovie.service';

describe('CategorymovieService', () => {
  let service: CategorymovieService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategorymovieService],
    }).compile();

    service = module.get<CategorymovieService>(CategorymovieService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
