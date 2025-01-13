import { join } from '@std/path';

export const DIRECTORY_WWW_OUTPUT = `./dist/www`;

export const DIRECTORY_LOG_OUTPUT = join(DIRECTORY_WWW_OUTPUT, 'logs');

export const DIRECTORY_BRACKET_LOGS = join(DIRECTORY_LOG_OUTPUT, 'brackets');

export const DIRECTORY_MATCH_LOGS = join(DIRECTORY_LOG_OUTPUT, 'matches');

export const FILE_WWW_LANDING_INDEX = join(DIRECTORY_WWW_OUTPUT, 'index.html');

export const FILE_LOG_LANDING_INDEX = join(DIRECTORY_LOG_OUTPUT, 'index.html');
