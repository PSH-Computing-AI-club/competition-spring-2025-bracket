import { join } from '@std/path';

import { makeBracket } from './lib/bracket.ts';
import { transformCompetitorData } from './lib/competitor.ts';
import { generateDaySeed, RUN_IDENTIFIER } from './lib/util.ts';

import COMPETITOR_MANIFEST from './competitors.json' with { type: 'json' };

const SEED = generateDaySeed();

const DIRECTORY_OUTPUT = `./dist/output/${RUN_IDENTIFIER}`;

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
