import * as Joi from 'joi';

export const registerValidate = Joi.object({
  username: Joi.string().required(),
  fullname: Joi.string().required(),
  password: Joi.string().required(),
  age: Joi.number().required(),
  role: Joi.number(),
  address: Joi.string().required(),
  movieView: Joi.number(),
});

export const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});
