import { randomIntegerBetween, randomSeeded, shuffle } from '@std/random';

import type { ICompetitor } from './competitor.ts';
import { simulateCompetitors } from './competitor.ts';
import { pairElements } from './util.ts';

export interface IBracketMatch {
    readonly gridColumns: number;

    readonly gridRows: number;

    readonly matchIndex: number;

    readonly seed: number;

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

function computeMaxRounds(numberOfCompetitors: number): number {
    return Math.ceil(Math.log2(numberOfCompetitors));
}

function determineGridDimensions(roundsRemaining: number): [number, number] {
    // We want to scale up the board as we reach the final match ups. This
    // increases the complexity of a Dots and Boxes game session. Thus making
    // for a tougher match.
    switch (roundsRemaining) {
        // finals
        case 0:
            return [7, 5];

        // semi-finals
        case 1:
            return [6, 4];
    }

    // other matchups
    return [5, 3];
}

export function makeBracket(options: IBracketOptions): IBracket {
    const { competitors, matchesBestOf, seed, suddenDeathMax } = options;

    const maxRounds = computeMaxRounds(competitors.length);
    const matchesWinCount = Math.ceil(matchesBestOf / 2);

    const prng = randomSeeded(seed);

    async function computeMatch(
        competitorA: ICompetitor,
        competitorB: ICompetitor,
        roundIndex: number,
        matchIndex: number,
    ): Promise<IBracketMatch> {
        const simulationSeed = randomIntegerBetween(0, Number.MAX_SAFE_INTEGER);

        const roundsRemaining = maxRounds - roundIndex - 1;
        const [gridColumns, gridRows] = determineGridDimensions(
            roundsRemaining,
        );

        const winner = await simulateCompetitors(
            {
                gridColumns,
                gridRows,
                seed: simulationSeed,
            },
            competitorA,
            competitorB,
        );

        return {
            gridColumns,
            gridRows,
            matchIndex,
            seed: simulationSeed,
            winner,
        };
    }

    async function computePair(
        competitorA: ICompetitor,
        competitorB: ICompetitor,
        roundIndex: number,
        pairIndex: number,
    ): Promise<IBracketPair> {
        const matches: IBracketMatch[] = [];

        let matchIndex = 0;

        let aWins = 0;
        let bWins = 0;

        while (
            matchIndex < matchesBestOf &&
            aWins < matchesWinCount &&
            bWins < matchesWinCount
        ) {
            const match = await computeMatch(
                competitorA,
                competitorB,
                roundIndex,
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
                matchIndex++;

                const match = await computeMatch(
                    competitorA,
                    competitorB,
                    roundIndex,
                    matchIndex,
                );

                matches.push(match);

                if (match.winner) {
                    ({ winner } = match);
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
                        roundIndex,
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

            for (let roundIndex = 0; roundIndex < maxRounds; roundIndex++) {
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
            }

            return {
                rounds,
                winner: currentRoundCompetitors[0],
            };
        },
    };
}
