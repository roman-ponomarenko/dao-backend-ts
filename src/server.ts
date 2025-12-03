import app from './app';
import {logger} from "./logger";
import {config} from "./config/config";
import * as cron from 'node-cron'
import {ScheduledTask} from "node-cron/dist/cjs/tasks/scheduled-task";
import {loadHistoricalEvents, poolForEvents} from "./events/index"

let scheduledPollingTask: ScheduledTask | null = null;

async function initialize() {
    try {
        logger.info('Starting Web3 DAO event listener...');

        await loadHistoricalEvents();

        logger.info(`Starting event polling with ${config.CRON_SCHEDULE} schedule`);

        scheduledPollingTask = cron.schedule(config.CRON_SCHEDULE, () => poolForEvents());
        scheduledPollingTask.start();

        app.listen(config.PORT, () => {
            logger.info(`Server running on port ${config.PORT}`);
        });
    } catch (e) {
        logger.error(`Error starting server: ${e}`);
        process.exit(1);
    }
}

initialize();