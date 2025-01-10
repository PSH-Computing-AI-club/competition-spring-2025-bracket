import { basename, dirname, join } from '@std/path';

import type { IBracket, IBracketResults } from './bracket.ts';
import type { ICompetitor } from './competitor.ts';

export interface IRunResults {
    readonly competitors: ICompetitor[];

    readonly matchesBestOf: number;

    readonly seed: string;

    readonly suddenDeathMax: number;

    readonly rounds: {
        readonly pairs: {
            readonly competitorA: string;

            readonly competitorB: string;

            readonly matches: {
                readonly gridColumns: number;

                readonly gridRows: number;

                readonly matchIndex: number;

                readonly playerA: string;

                readonly playerB: string;

                readonly seed: number;

                readonly winner: string | null;
            }[];

            readonly pairIndex: number;

            readonly winner: string;
        }[];

        readonly roundIndex: number;
    }[];

    readonly winner: string;
}

export function transformBracketResults(
    bracket: IBracket,
    bracketResults: IBracketResults,
): IRunResults {
    const { competitors, matchesBestOf, seed, suddenDeathMax } = bracket;
    const { rounds, winner } = bracketResults;

    return {
        competitors: competitors.map((competitor) => {
            const { name, playerFile, repository } = competitor;

            const playerBaseName = basename(playerFile);
            const playerDirectoryName = basename(dirname(playerFile));

            const correctedPlayerFile = join(
                playerDirectoryName,
                playerBaseName,
            );

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

        winner: winner.name,

        rounds: rounds
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
    };
}
