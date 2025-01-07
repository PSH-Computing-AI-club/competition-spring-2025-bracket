import { join } from '@std/path';

import { exec } from './util.ts';

import COMPETITORS_MANIFEST from './competitors.json' with { type: 'json' };

const DIRECTORY_COMPETITOR_REPOSITORIES = './competitors';

const FILE_COMPETITOR_PLAYER = './mod.js';

const UNIX_EPOCH = Temporal.PlainDate.from({
    year: 1970,
    month: 1,
    day: 1,
});

const BRACKET_SEED = Temporal.Now.plainDateISO().since(UNIX_EPOCH).round({
    largestUnit: 'nanoseconds',
}).nanoseconds;

console.log('Starting bracket run...\n');
console.log(`Seed: ${BRACKET_SEED}\n`);

console.log('Processing competitors...');

const COMPETITORS = await Promise.all(
    COMPETITORS_MANIFEST.map(async (competitor) => {
        const { name, repository } = competitor;

        const repositoryURL = new URL(repository);

        // **TODO:** git clone their repositories

        // await exec('git', 'clone', repository);

        const filePath = join(
            DIRECTORY_COMPETITOR_REPOSITORIES,
            name,
            FILE_COMPETITOR_PLAYER,
        );

        return {
            filePath,
            name,
            repository: repositoryURL,
        };
    }),
);

console.log('Competitors:\n');

for (const competitor of COMPETITORS) {
    const { name, repository } = competitor;
    const { host, pathname } = repository;

    console.log(`Competitor '${name}' [${host}${pathname}]`);
}

console.log({ COMPETITORS });
