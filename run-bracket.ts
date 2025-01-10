import { join } from '@std/path';

import { makeBracket } from './lib/bracket.ts';
import { transformCompetitorData } from './lib/competitor.ts';
import { transformBracketResults } from './lib/results.ts';
import { generateDaySeed, RUN_IDENTIFIER } from './lib/util.ts';

import COMPETITOR_MANIFEST from './competitors.json' with { type: 'json' };

const DIRECTORY_OUTPUT = `./dist/output/${RUN_IDENTIFIER}`;

const DIRECTORY_GAME_LOGS = join(DIRECTORY_OUTPUT, 'game-logs');

await Deno.mkdir(DIRECTORY_OUTPUT, { recursive: true });

const COMPETITORS = await transformCompetitorData(COMPETITOR_MANIFEST);

const bracket = makeBracket({
    competitors: COMPETITORS,
    logPath: DIRECTORY_GAME_LOGS,
    matchesBestOf: 5,
    seed: generateDaySeed(),
    suddenDeathMax: 3,
});

const bracketResults = await bracket.computeBracket();
const runResults = transformBracketResults(bracket, bracketResults);

console.log(JSON.stringify(runResults, null, 4));
