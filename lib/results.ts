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
