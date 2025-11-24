import { Request, Response, NextFunction } from 'express';
import {logger} from "../logger";

export interface AppError extends Error {
    status?: number;
}

export const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    logger.info(err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
    });
};

export const logHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    logger.info(`Request received: ${req.method} ${req.url}`);
    next();
};