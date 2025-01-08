import { join } from '@std/path';

import { makeBracket } from './lib/bracket.ts';
import { transformCompetitorData } from './lib/competitor.ts';
import { generateDaySeed } from './lib/util.ts';

import COMPETITOR_MANIFEST from './competitors.json' with { type: 'json' };

const TODAY = Temporal.Now.plainDateISO();

const SEED = generateDaySeed();

const DIRECTORY_OUTPUT = `./dist/output/${TODAY.year}-${
    TODAY.month.toString().padStart(2, '0')
}-${TODAY.day.toString().padStart(2, '0')}`;

const DIRECTORY_GAME_LOGS = join(DIRECTORY_OUTPUT, 'game-logs');

await Deno.mkdir(DIRECTORY_OUTPUT, { recursive: true });

const COMPETITORS = await transformCompetitorData(COMPETITOR_MANIFEST);

const bracket = makeBracket({
    competitors: COMPETITORS,
    logPath: DIRECTORY_GAME_LOGS,
    matchesBestOf: 5,
    seed: SEED,
    suddenDeathMax: 3,
});

const results = await bracket.computeBracket();

console.log({ results });
