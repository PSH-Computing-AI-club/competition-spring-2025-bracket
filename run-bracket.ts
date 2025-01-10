import { join } from '@std/path';

import { makeBracket } from './lib/bracket.ts';
import { transformCompetitorData } from './lib/competitor.ts';
import type { IRunResults } from './lib/results.ts';
import { generateDaySeed, RUN_IDENTIFIER } from './lib/util.ts';

import COMPETITOR_MANIFEST from './competitors.json' with { type: 'json' };

const DIRECTORY_OUTPUT = `./dist/output/${RUN_IDENTIFIER}`;

const DIRECTORY_GAME_LOGS = join(DIRECTORY_OUTPUT, 'game-logs');

await Deno.mkdir(DIRECTORY_OUTPUT, { recursive: true });

const COMPETITORS = await transformCompetitorData(COMPETITOR_MANIFEST);

const { computeBracket, matchesBestOf, seed, suddenDeathMax } = makeBracket({
    competitors: COMPETITORS,
    logPath: DIRECTORY_GAME_LOGS,
    matchesBestOf: 5,
    seed: generateDaySeed(),
    suddenDeathMax: 3,
});

const bracketResults = await computeBracket();

const runResults = bracketResults satisfies IRunResults;

console.log(JSON.stringify(runResults, null, 4));
