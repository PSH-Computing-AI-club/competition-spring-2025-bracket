import { makeBracket } from './bracket.ts';
import {
    cloneCompetitorRepositories,
    transformCompetitorData,
} from './competitor.ts';
import { generateDaySeed } from './util.ts';

import COMPETITOR_MANIFEST from './competitors.json' with { type: 'json' };

const COMPETITORS = transformCompetitorData(COMPETITOR_MANIFEST);

const SEED = generateDaySeed();

await cloneCompetitorRepositories(COMPETITORS);

const bracket = makeBracket({
    competitors: COMPETITORS,
    matchesBestOf: 5,
    seed: SEED,
    suddenDeathMax: 3,
});

const results = await bracket.computeBracket();

console.log({ results });
