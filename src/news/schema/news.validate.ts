import * as Joi from 'joi';

export const createNewsSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
  categories: Joi.string().required(),
  author: Joi.string().required(),
});

export const getNewsSchema = Joi.object({
  skip: Joi.number().required(),
  limit: Joi.number().required(),
});

export const paramsId = Joi.object({
  id: Joi.string().min(24).required(),
});

export const updateNewsSchema = Joi.object({
  id: Joi.string().min(24).required(),
  title: Joi.string().required(),
  content: Joi.string().required(),
  categories: Joi.string().required(),
  author: Joi.string().required(),
});

export const getNewsByCategory = Joi.object({
  categories: Joi.string().required(),
});
