import * as Joi from 'joi';

export const createCategorySchema = Joi.object({
  title: Joi.string().required(),
  userCreated: Joi.string().required(),
  movie: Joi.array(),
});

export const paramsId = Joi.object({
  id: Joi.string().min(24).required(),
});
