import { basename, dirname, join } from '@std/path';

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

const runResults = {
    competitors: COMPETITORS.map((competitor) => {
        const { name, playerFile, repository } = competitor;

        const playerBaseName = basename(playerFile);
        const playerDirectoryName = basename(dirname(playerFile));

        const correctedPlayerFile = join(playerDirectoryName, playerBaseName);

        return {
            name,
            playerFile: correctedPlayerFile,
            repository,
        };
    }),
    matchesBestOf,

    // **HACK:** The type of `seed` is `bigint`. JSON only natively supports storing
    // number values that are equal to or less than `Number.MAX_SAFE_INTEGER`.
    //
    // So we need to manually serialize the seed as a string and special case parsing
    // the value.
    seed: seed.toString(),
    suddenDeathMax,

    winner: bracketResults.winner.name,

    rounds: bracketResults
        .rounds
        .map((round) => {
            const { pairs, roundIndex } = round;

            return {
                roundIndex,
                pairs: pairs
                    .map((pair) => {
                        const {
                            competitorA,
                            competitorB,
                            matches,
                            pairIndex,
                            winner,
                        } = pair;

                        return {
                            competitorA: competitorA.name,
                            competitorB: competitorB.name,
                            pairIndex,
                            winner: winner.name,

                            matches: matches
                                .map((match) => {
                                    const {
                                        gridColumns,
                                        gridRows,
                                        matchIndex,
                                        playerA,
                                        playerB,
                                        seed,
                                        winner,
                                    } = match;

                                    return {
                                        gridColumns,
                                        gridRows,
                                        matchIndex,
                                        playerA: playerA.name,
                                        playerB: playerB.name,
                                        seed,
                                        winner: winner?.name ?? null,
                                    };
                                }),
                        };
                    }),
            };
        }),
} satisfies IRunResults;

console.log(JSON.stringify(runResults, null, 4));
