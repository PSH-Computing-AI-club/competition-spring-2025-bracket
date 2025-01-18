import {
    DIRECTORY_COMPETITOR_REPOSITORIES,
    transformCompetitorData,
} from './lib/competitor.ts';
import { fetchAppInstallationTokens } from './lib/github.ts';
import { exec } from './lib/util.ts';

import COMPETITOR_MANIFEST from './competitors.json' with { type: 'json' };

await Deno.mkdir(DIRECTORY_COMPETITOR_REPOSITORIES, { recursive: true });

const COMPETITORS = await transformCompetitorData(COMPETITOR_MANIFEST);

const APP_ID = Deno
    .env
    .get('APP_ID')!;

const APP_PRIVATE_KEY = Deno
    .env
    .get('APP_PRIVATE_KEY')!
    .replace(
        /\\n/g,
        '\n',
    );

const tokens = await fetchAppInstallationTokens({
    allowedAccounts: COMPETITORS.map(
        (competitor) => competitor.account,
    ),
    appID: APP_ID,
    privateKey: APP_PRIVATE_KEY,
});

await Promise.all(
    COMPETITORS
        .map(async (competitor) => {
            const { account, cloneDirectory, url } = competitor;
            const token = tokens[account];

            const urlWithToken = new URL(url);

            urlWithToken.username = 'oauth2';
            urlWithToken.password = token;

            // **HACK:** `git clone` reports progress to stderr _even if successful_.

            const { stderr } = await exec(
                'git',
                'clone',
                '--depth',
                '1',
                '--progress',
                urlWithToken.toString(),
                cloneDirectory,
            );

            const maskedStderr = stderr.replaceAll(
                token,
                '*'.repeat(token.length),
            );

            console.log(maskedStderr);
        }),
);
