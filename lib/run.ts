import { join } from '@std/path';

const NOW = Temporal.Now.plainDateTimeISO();

const RUNS_PER_DAY = 6;

const HOURS_BETWEEN_RUNS = 24 / RUNS_PER_DAY;

const UNIX_EPOCH = Temporal.PlainDate.from({
    year: 1970,
    month: 1,
    day: 1,
});

export const RUN_NUMBER = Math.floor(NOW.hour / HOURS_BETWEEN_RUNS) + 1;

export const RUN_IDENTIFIER = `${NOW.year}-${
    NOW.month.toString().padStart(2, '0')
}-${NOW.day.toString().padStart(2, '0')}.${RUN_NUMBER}`;

export const DIRECTORY_RUN_OUTPUT = `./dist/output/${RUN_IDENTIFIER}`;

export const DIRECTORY_MATCH_LOGS = join(DIRECTORY_RUN_OUTPUT, 'match-logs');

export const FILE_RUN_LOG = join(DIRECTORY_RUN_OUTPUT, 'bracket.json');

export function generateRunSeed(): bigint {
    const { nanoseconds } = Temporal
        .Now
        .plainDateISO()
        .since(UNIX_EPOCH)
        .round({
            largestUnit: 'nanoseconds',
        });

    return BigInt(nanoseconds);
}
