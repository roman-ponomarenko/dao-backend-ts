import app from './app';
import {logger} from "./logger";
import {config} from "./config/config";

app.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT}`);
});