import { randomIntegerBetween, randomSeeded, shuffle } from '@std/random';

import type { ICompetitor } from './competitor.ts';
import { simulateCompetitors } from './competitor.ts';
import { pairElements } from './util.ts';

export interface IBracketMatch {
    readonly matchIndex: number;

    readonly winner: ICompetitor | null;
}

export interface IBracketPair {
    readonly competitorA: ICompetitor;

    readonly competitorB: ICompetitor;

    readonly matches: IBracketMatch[];

    readonly pairIndex: number;

    readonly winner: ICompetitor;
}

export interface IBracketRound {
    readonly pairs: IBracketPair[];

    readonly roundIndex: number;
}

export interface IBracketResults {
    readonly rounds: IBracketRound[];

    readonly winner: ICompetitor;
}

export interface IBracketOptions {
    readonly competitors: ICompetitor[];

    readonly matchesBestOf: number;

    readonly seed: bigint;

    readonly suddenDeathMax: number;
}

export interface IBracket {
    computeBracket(): Promise<IBracketResults>;
}

export function makeBracket(options: IBracketOptions): IBracket {
    const { competitors, matchesBestOf, seed, suddenDeathMax } = options;

    const matchesWinCount = Math.ceil(matchesBestOf / 2);
    const prng = randomSeeded(seed);

    async function computeMatch(
        competitorA: ICompetitor,
        competitorB: ICompetitor,
        matchIndex: number,
    ): Promise<IBracketMatch> {
        const simulationSeed = randomIntegerBetween(0, Number.MAX_SAFE_INTEGER);

        const winner = await simulateCompetitors(
            { seed: simulationSeed },
            competitorA,
            competitorB,
        );

        return { matchIndex, winner };
    }

    async function computePair(
        competitorA: ICompetitor,
        competitorB: ICompetitor,
        pairIndex: number,
    ): Promise<IBracketPair> {
        const matches: IBracketMatch[] = [];

        let aWins = 0;
        let bWins = 0;
        let matchIndex = 0;

        while (
            matchIndex < matchesBestOf &&
            aWins < matchesWinCount &&
            bWins < matchesWinCount
        ) {
            const match = await computeMatch(
                competitorA,
                competitorB,
                matchIndex,
            );

            matches.push(match);

            if (match.winner === competitorA) aWins++;
            else if (match.winner === competitorB) bWins++;

            matchIndex++;
        }

        let winner: ICompetitor | null = null;

        if (aWins > bWins) winner = competitorA;
        else if (bWins > aWins) winner = competitorB;
        else {
            let suddenDeathMatches = 0;

            while (suddenDeathMatches < suddenDeathMax) {
                const match = await computeMatch(
                    competitorA,
                    competitorB,
                    matchIndex++,
                );

                matches.push(match);

                if (match.winner) {
                    winner = match.winner;
                    break;
                }

                suddenDeathMatches++;
            }

            if (suddenDeathMatches === suddenDeathMax) {
                winner = prng() < 0.5 ? competitorA : competitorB;
            }
        }

        return {
            competitorA,
            competitorB,
            matches,
            pairIndex,
            winner: winner!,
        };
    }

    async function computeRound(
        competitors: ICompetitor[],
        roundIndex: number,
    ): Promise<IBracketRound> {
        const pairs: IBracketPair[] = await Promise.all(
            pairElements(competitors)
                .map((pair, pairIndex) => {
                    const [competitorA, competitorB] = pair;

                    return computePair(
                        competitorA,
                        competitorB,
                        pairIndex,
                    );
                }),
        );

        return {
            pairs,
            roundIndex,
        };
    }

    return {
        async computeBracket() {
            const rounds: IBracketRound[] = [];

            let currentRoundCompetitors = shuffle(competitors, { prng });
            let roundIndex = 0;

            while (currentRoundCompetitors.length > 1) {
                const currentRound = await computeRound(
                    currentRoundCompetitors,
                    roundIndex,
                );

                const { pairs } = currentRound;

                rounds.push(currentRound);

                currentRoundCompetitors = pairs
                    .map((pair) => {
                        const { winner } = pair;

                        return winner;
                    });

                roundIndex++;
            }

            return {
                rounds,
                winner: currentRoundCompetitors[0],
            };
        },
    };
}
