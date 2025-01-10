import { randomIntegerBetween, randomSeeded, shuffle } from '@std/random';
import { join } from '@std/path';

import type { ICompetitor } from './competitor.ts';
import { simulate } from './simulation.ts';
import { pairElements } from './util.ts';

const FILE_GAME_LOG = (
    { matchIndex, pairIndex, roundIndex }: {
        matchIndex: number;
        pairIndex: number;
        roundIndex: number;
    },
) => `round-${roundIndex + 1}.pair-${pairIndex + 1}.match-${
    matchIndex + 1
}.json`;

export interface IBracketMatch {
    readonly gridColumns: number;

    readonly gridRows: number;

    readonly matchIndex: number;

    readonly playerA: ICompetitor;

    readonly playerB: ICompetitor;

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
    readonly firstPlace: ICompetitor;

    readonly secondPlace: ICompetitor;

    readonly rounds: IBracketRound[];
}

export interface IBracketOptions {
    readonly competitors: ICompetitor[];

    readonly logPath: string;

    readonly matchesBestOf: number;

    readonly seed: bigint;

    readonly suddenDeathMax: number;
}

export interface IBracket extends IBracketOptions {
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
    const {
        competitors,
        logPath,
        matchesBestOf,
        seed,
        suddenDeathMax,
    } = options;

    const maxRounds = computeMaxRounds(competitors.length);
    const matchesWinCount = Math.ceil(matchesBestOf / 2);

    const prng = randomSeeded(seed);

    async function computeMatch(
        playerA: ICompetitor,
        playerB: ICompetitor,
        roundIndex: number,
        pairIndex: number,
        matchIndex: number,
    ): Promise<IBracketMatch> {
        const simulationSeed = randomIntegerBetween(
            0,
            Number.MAX_SAFE_INTEGER,
            { prng },
        );

        const roundsRemaining = maxRounds - roundIndex - 1;
        const [gridColumns, gridRows] = determineGridDimensions(
            roundsRemaining,
        );

        const logFilePath = join(
            logPath,
            FILE_GAME_LOG({ matchIndex, pairIndex, roundIndex }),
        );

        const winner = await simulate(
            {
                gridColumns,
                gridRows,
                logFilePath,
                seed: simulationSeed,
            },
            playerA,
            playerB,
        );

        return {
            playerA,
            gridColumns,
            gridRows,
            matchIndex,
            playerB,
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

        let competitors = shuffle([competitorA, competitorB], { prng });

        while (
            matchIndex < matchesBestOf &&
            aWins < matchesWinCount &&
            bWins < matchesWinCount
        ) {
            const [playerA, playerB] = competitors;

            const match = await computeMatch(
                playerA,
                playerB,
                roundIndex,
                pairIndex,
                matchIndex,
            );

            matches.push(match);

            switch (match.winner) {
                case competitorA:
                    competitors = [competitorB, competitorA];

                    aWins++;
                    break;

                case competitorB:
                    competitors = [competitorA, competitorB];

                    bWins++;
                    break;
            }

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
                    pairIndex,
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
        const pairs: IBracketPair[] = [];

        for (const [pairIndex, pair] of pairElements(competitors).entries()) {
            const [competitorA, competitorB] = pair;

            const computedPair = await computePair(
                competitorA,
                competitorB,
                roundIndex,
                pairIndex,
            );

            pairs.push(computedPair);
        }

        return {
            pairs,
            roundIndex,
        };
    }

    return {
        competitors,
        logPath,
        matchesBestOf,
        seed,
        suddenDeathMax,

        async computeBracket() {
            const rounds: IBracketRound[] = [];

            let currentRoundCompetitors = shuffle(competitors, { prng });
            let finalPair: IBracketPair | null = null;

            for (let roundIndex = 0; roundIndex < maxRounds; roundIndex++) {
                const currentRound = await computeRound(
                    currentRoundCompetitors,
                    roundIndex,
                );

                const { pairs } = currentRound;

                rounds.push(currentRound);

                if (roundIndex === maxRounds - 1) {
                    finalPair = pairs[0];
                }

                currentRoundCompetitors = pairs
                    .map((pair) => {
                        const { winner } = pair;

                        return winner;
                    });
            }

            const { competitorA, competitorB, winner: firstPlace } = finalPair!;
            const secondPlace = firstPlace === competitorA
                ? competitorB
                : competitorA;

            return {
                firstPlace,
                rounds,
                secondPlace,
            };
        },
    };
}
