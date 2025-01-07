import { pairElements } from './util.ts';

const MATCHES_BEST_OF = 5;

const MATCHES_WIN_COUNT = Math.ceil(MATCHES_BEST_OF / 2);

const SUDDEN_DEATH_MAX = 3;

export interface ICompetitor {
    readonly filePath: string;

    readonly name: string;

    readonly repository: URL;
}

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

export async function computeMatch(
    competitorA: ICompetitor,
    competitorB: ICompetitor,
    matchIndex: number,
): Promise<IBracketMatch> {
    // **TODO:** compute match

    return { matchIndex, winner };
}

export async function computePair(
    competitorA: ICompetitor,
    competitorB: ICompetitor,
    pairIndex: number,
): Promise<IBracketPair> {
    const matches: IBracketMatch[] = [];

    let aWins = 0;
    let bWins = 0;
    let matchIndex = 0;

    while (
        matchIndex < MATCHES_BEST_OF &&
        aWins < MATCHES_WIN_COUNT &&
        bWins < MATCHES_WIN_COUNT
    ) {
        const match = await computeMatch(competitorA, competitorB, matchIndex);

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

        while (suddenDeathMatches < SUDDEN_DEATH_MAX) {
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

        if (suddenDeathMatches === SUDDEN_DEATH_MAX) {
            winner = Math.random() < 0.5 ? competitorA : competitorB;
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

export async function computeRound(
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

export async function computeBracket(
    competitors: ICompetitor[],
): Promise<IBracketResults> {
    const rounds: IBracketRound[] = [];

    let currentRoundCompetitors = [...competitors];
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
}
