import {
    DIRECTORY_COMPETITOR_REPOSITORIES,
    transformCompetitorData,
} from './lib/competitor.ts';
import { exec } from './lib/util.ts';

import COMPETITOR_MANIFEST from './competitors.json' with { type: 'json' };

// **TODO:** make `./competitors` directory, clone into that directory

await Deno.mkdir(DIRECTORY_COMPETITOR_REPOSITORIES, { recursive: true });

const COMPETITORS = await transformCompetitorData(COMPETITOR_MANIFEST);

await Promise.all(
    COMPETITORS
        .map(async (competitor) => {
            const { repository } = competitor;

            const output = await exec('git', 'clone', repository.toString());

            console.log(output);
        }),
);
