import * as Joi from 'joi';

export const createMovieSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  authorCreated: Joi.string().required(),
  categoryMovie: Joi.string().required(),
  views: Joi.number(),
  filmLocation: Joi.string().required(),
  status: Joi.number().min(0).max(3),
  region: Joi.string().required(),
  fileName: Joi.string().required(),
});

export const idPrams = Joi.object({
  id: Joi.string().min(24).required(),
});

export const buyMovieSchema = Joi.object({
  email: Joi.string().email().required(),
  amount: Joi.number().required().min(0),
  movieId: Joi.string().required(),
  currency: Joi.string().default('usd'),
});
