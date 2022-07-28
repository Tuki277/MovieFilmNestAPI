import * as Joi from 'joi';

export const createCategorySchema = Joi.object({
  title: Joi.string().required(),
  userCreated: Joi.string().required(),
  movie: Joi.array(),
});

export const paramsId = Joi.object({
  id: Joi.string().min(24).required(),
});

const payload = {
  body: Joi.object({
    title: Joi.string().required(),
    userCreated: Joi.string(),
    movie: Joi.array(),
  }),
};

const params = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
};

export const updateCategorySchema = Joi.object({
  ...payload,
  ...params,
}).unknown(true);
