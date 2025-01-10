import { basename, dirname, join } from '@std/path';

import type {
    IBracket,
    IBracketMatch,
    IBracketPair,
    IBracketResults,
    IBracketRound,
} from './bracket.ts';
import type { ICompetitor } from './competitor.ts';

export interface IRunResults {
    readonly competitors: ICompetitor[];

    readonly firstPlace: string;

    readonly matchesBestOf: number;

    readonly secondPlace: string;

    readonly seed: string;

    readonly suddenDeathMax: number;

    readonly thirdPlace: string;

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

    readonly thirdPlacePair: {
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
    };
}

function transformMatches(
    matches: IBracketMatch[],
): IRunResults['rounds'][number]['pairs'][number]['matches'] {
    return matches
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
                playerA: playerA.identifier,
                playerB: playerB.identifier,
                seed,
                winner: winner?.identifier ?? null,
            };
        });
}

function transformPairs(
    pairs: IBracketPair[],
): IRunResults['rounds'][number]['pairs'] {
    return pairs
        .map((pair) => {
            const {
                competitorA,
                competitorB,
                matches,
                pairIndex,
                winner,
            } = pair;

            return {
                competitorA: competitorA.identifier,
                competitorB: competitorB.identifier,
                pairIndex,
                winner: winner.identifier,

                matches: transformMatches(matches),
            };
        });
}

function transformRounds(rounds: IBracketRound[]): IRunResults['rounds'] {
    return rounds
        .map((round) => {
            const { pairs, roundIndex } = round;

            return {
                roundIndex,
                pairs: transformPairs(pairs),
            };
        });
}

export function transformBracketResults(
    bracket: IBracket,
    bracketResults: IBracketResults,
): IRunResults {
    const { competitors, matchesBestOf, seed, suddenDeathMax } = bracket;
    const { firstPlace, rounds, secondPlace, thirdPlace, thirdPlacePair } =
        bracketResults;

    return {
        matchesBestOf,

        // **HACK:** The type of `seed` is `bigint`. JSON only natively supports storing
        // number values that are equal to or less than `Number.MAX_SAFE_INTEGER`.
        //
        // So we need to manually serialize the seed as a string and special case parsing
        // the value.
        seed: seed.toString(),
        suddenDeathMax,

        firstPlace: firstPlace.identifier,
        secondPlace: secondPlace.identifier,
        thirdPlace: thirdPlace.identifier,

        competitors: competitors.map((competitor) => {
            const { identifier, name, playerFile, repository } = competitor;

            const playerBaseName = basename(playerFile);
            const playerDirectoryName = basename(dirname(playerFile));

            const correctedPlayerFile = join(
                playerDirectoryName,
                playerBaseName,
            );

            return {
                identifier,
                name,
                playerFile: correctedPlayerFile,
                repository,
            };
        }),

        rounds: transformRounds(rounds),
        thirdPlacePair: transformPairs([thirdPlacePair])[0],
    };
}
