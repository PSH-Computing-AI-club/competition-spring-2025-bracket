import { makeBracket } from './lib/bracket.ts';
import { transformCompetitorData } from './lib/competitor.ts';
import { generateDaySeed } from './lib/util.ts';

import COMPETITOR_MANIFEST from './competitors.json' with { type: 'json' };

const SEED = generateDaySeed();

const COMPETITORS = await transformCompetitorData(COMPETITOR_MANIFEST);


const bracket = makeBracket({
    competitors: COMPETITORS,
    matchesBestOf: 5,
    seed: SEED,
    suddenDeathMax: 3,
});

const results = await bracket.computeBracket();

console.log({ results });
