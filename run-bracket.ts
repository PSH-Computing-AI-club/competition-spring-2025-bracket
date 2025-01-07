import {
    cloneCompetitorRepositories,
    transformCompetitorData,
} from './competitor.ts';
import { exec, generateDaySeed } from './util.ts';

import COMPETITOR_MANIFEST from './competitors.json' with { type: 'json' };

const COMPETITORS = transformCompetitorData(COMPETITOR_MANIFEST);

const SEED = generateDaySeed();

await cloneCompetitorRepositories(COMPETITORS);
