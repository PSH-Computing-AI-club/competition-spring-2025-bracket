import { makeBracket } from './lib/bracket.ts';
import { transformCompetitorData } from './lib/competitor.ts';
import { transformBracketResults } from './lib/results.ts';
import {
    DIRECTORY_GAME_LOGS,
    DIRECTORY_RUN_OUTPUT,
    FILE_RUN_LOG,
    generateRunSeed,
} from './lib/run.ts';

import COMPETITOR_MANIFEST from './competitors.json' with { type: 'json' };

await Deno.mkdir(DIRECTORY_RUN_OUTPUT, { recursive: true });

const COMPETITORS = await transformCompetitorData(COMPETITOR_MANIFEST);

const bracket = makeBracket({
    competitors: COMPETITORS,
    logPath: DIRECTORY_GAME_LOGS,
    matchesBestOf: 5,
    seed: generateRunSeed(),
    suddenDeathMax: 3,
});

const bracketResults = await bracket.computeBracket();
const runResults = transformBracketResults(bracket, bracketResults);

const serializedResults = JSON.stringify(runResults);

await Deno.writeTextFile(FILE_RUN_LOG, serializedResults);
