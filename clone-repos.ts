import { exec } from './lib/util.ts';

import COMPETITOR_MANIFEST from './competitors.json' with { type: 'json' };

// **TODO:** make `./competitors` directory, clone into that directory

await Promise.all(
    COMPETITOR_MANIFEST
        .map(async (competitor) => {
            const { repository } = competitor;

            const output = await exec('git', 'clone', repository.toString());

            console.log(output);
        }),
);
