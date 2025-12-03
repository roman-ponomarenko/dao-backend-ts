import pino from 'pino';
import {config} from "./config/config";

export const logger = pino({
    level: config.LOG_LEVEL,
    transport: {
        target: "pino-pretty",
        options: {
            colorize: true,
            ignore: "pid,hostname",
            translateTime: "SYS:dd-mm-yyyy HH:MM:ss"
        }
    }
});