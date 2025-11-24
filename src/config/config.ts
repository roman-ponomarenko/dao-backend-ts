import {cleanEnv, str, num, url} from 'envalid';
import dotenv from 'dotenv';

dotenv.config({path: '.env'});

export const config = cleanEnv(process.env, {
    PORT: num(),
    RPC_URL: url(),
    DAO_ADDRESS: str(),
});