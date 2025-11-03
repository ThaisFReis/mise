import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Middleware para validar requisições com Zod schemas
 */
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validar body, query e params
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      return next(error);
    }
  };
};

/**
 * Middleware para validar apenas o body
 */
export const validateBody = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      return next(error);
    }
  };
};

/**
 * Middleware para validar apenas a query
 */
export const validateQuery = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Converter string numbers para numbers
      const query: any = {};
      for (const [key, value] of Object.entries(req.query)) {
        if (value === 'true') query[key] = true;
        else if (value === 'false') query[key] = false;
        else if (!isNaN(Number(value))) query[key] = Number(value);
        else query[key] = value;
      }

      const validated = await schema.parseAsync(query);
      req.query = validated as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      return next(error);
    }
  };
};

/**
 * Middleware para validar apenas os params
 */
export const validateParams = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Converter string numbers para numbers
      const params: any = {};
      for (const [key, value] of Object.entries(req.params)) {
        if (!isNaN(Number(value))) params[key] = Number(value);
        else params[key] = value;
      }

      const validated = await schema.parseAsync(params);
      req.params = validated as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      return next(error);
    }
  };
};
