import type { ICompetitor } from './competitor.ts';

export interface IRunResults {
    readonly competitors: ICompetitor[];

    readonly matchesBestOf: number;

    readonly seed: string;

    readonly suddenDeathMax: number;

    readonly rounds: {
        readonly pairs: {
            readonly competitorA: ICompetitor;

            readonly competitorB: ICompetitor;

            readonly matches: {
                readonly gridColumns: number;

                readonly gridRows: number;

                readonly matchIndex: number;

                readonly playerA: ICompetitor;

                readonly playerB: ICompetitor;

                readonly seed: number;

                readonly winner: ICompetitor | null;
            }[];

            readonly pairIndex: number;

            readonly winner: ICompetitor;
        }[];

        readonly roundIndex: number;
    }[];

    readonly winner: ICompetitor;
}
