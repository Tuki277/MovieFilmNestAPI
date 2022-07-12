import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('UserController', () => {
  let app: INestApplication;
  let token: string;
  const host = 'http://localhost:3000';
  let idFilm: string;

  beforeAll(async () => {
    const apiServiceProvider = {
      provide: UserService,
      useFactory: () => ({
        getAllUser: jest.fn(() => []),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService, apiServiceProvider],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  describe('login user', () => {
    let user;

    beforeAll(async () => {
      user = await request('http://localhost:3000').post('/auth/login').send({
        username: 'superadmin1',
        password: 'superadmin123',
      });
    });

    test('then it should return access token and refresh token', () => {
      const data = user._body.result;
      token = data.data;
      expect(user.statusCode).toBe(200);
      expect(user._body).toEqual({
        result: {
          error: false,
          message: 'Login Success',
          data: expect.any(String),
          accessToken: expect.any(String),
        },
      });
    });
  });

  describe('get users', () => {
    let user;

    beforeAll(async () => {
      user = await request(host)
        .get('/api/user/do=all')
        .set('Authorization', `Bearer ${token}`);
    });

    test('then it should return users', () => {
      const data = user._body.result.data;
      expect(user.statusCode).toBe(200);
      expect(user._body).toEqual({
        result: {
          error: false,
          message: 'query success',
          data,
        },
      });
    });
  });

  describe('get current user', () => {
    let user;

    beforeAll(async () => {
      user = await request(host)
        .get('/api/user/current-user')
        .set('Authorization', `Bearer ${token}`);
    });

    test('then it should return current users', () => {
      const data = user._body.result.data;
      expect(user.statusCode).toBe(200);
      expect(user._body).toEqual({
        result: {
          error: false,
          message: 'query success',
          data: {
            ...data,
            permission: true,
          },
        },
      });
    });
  });

  describe('get current user not token', () => {
    let user;

    beforeAll(async () => {
      user = await request(host).get('/api/user/current-user');
    });

    test('then it should return error', () => {
      expect(user.statusCode).toBe(404);
      expect(user._body).toEqual({
        result: {
          error: true,
          message: 'not found',
        },
      });
    });
  });

  describe('update user', () => {
    let user;

    beforeAll(async () => {
      user = await request(host)
        .put('/api/user/do=edit/62c7154c0c3c34d37e4ca9d6')
        .send({
          username: 'user4',
          password: 'user123',
          fullname: 'fullname user 4 update',
          age: 22,
          address: 'HN-VN',
          role: 3,
        })
        .set('Authorization', `Bearer ${token}`);
    });

    test('then it should return users updated', () => {
      const data = user._body.result.data;
      expect(user.statusCode).toBe(200);
      expect(user._body).toEqual({
        result: {
          error: false,
          message: 'updated',
          data,
        },
      });
    });
  });

  describe('get all movie', () => {
    let res;

    beforeAll(async () => {
      res = await request(host)
        .get('/api/movie/do=all')
        .set('Authorization', `Bearer ${token}`);
    });

    test('then it should return all film', () => {
      const data = res._body.result.data;
      idFilm = data[0]._id;
      expect(res.statusCode).toBe(200);
      expect(res._body).toEqual({
        result: {
          error: false,
          message: 'query success',
          data,
        },
      });
    });
  });

  describe('get film by user', () => {
    let res;

    beforeAll(async () => {
      res = await request(host)
        .get('/api/movie/user')
        .set('Authorization', `Bearer ${token}`);
    });

    test('then it should return all film by user upload', () => {
      const data = res._body.result.data;
      expect(res.statusCode).toBe(200);
      expect(res._body).toEqual({
        result: {
          error: false,
          message: 'query success',
          data,
        },
      });
    });
  });

  describe('download film by user', () => {
    let res;

    beforeAll(async () => {
      res = await request(host)
        .get(`/api/movie/do=download/${idFilm}`)
        .set('Authorization', `Bearer ${token}`);
    });

    test('then it should return all film by user download', () => {
      expect(res.statusCode).toBe(200);
    });
  });

  describe('get all category', () => {
    let res;

    beforeAll(async () => {
      res = await request(host)
        .get(`/api/categories/do=all`)
        .set('Authorization', `Bearer ${token}`);
    });

    test('then it should return all category by user', () => {
      const data = res._body.result.data;
      expect(res.statusCode).toBe(200);
      expect(res._body).toEqual({
        result: {
          error: false,
          message: 'query success',
          data,
        },
      });
    });
  });
});
