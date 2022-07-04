import * as Joi from 'joi';

export const createCategorySchema = Joi.object({
  title: Joi.string().required(),
  userCreated: Joi.string().required(),
  news: Joi.array(),
});
