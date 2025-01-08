import type { ICompetitor } from './competitor.ts';
import { exec } from './util.ts';

const FILE_GAME_ENGINE = './.bin/dotsandboxes-linux';

export interface ISimulateOptions {
    readonly gridColumns?: number;

    readonly gridRows?: number;

    readonly seed?: number;

    readonly timeout?: number;
}

export async function simulate(
    options: ISimulateOptions,
    ...competitors: ICompetitor[]
): Promise<ICompetitor | null> {
    const { gridColumns, gridRows, seed, timeout } = options;

    const cliOptions: string[] = [];

    if (gridColumns !== undefined) {
        cliOptions.push(
            '--grid-columns',
            gridColumns.toString(),
        );
    }

    if (gridRows !== undefined) {
        cliOptions.push(
            '--grid-rows',
            gridRows.toString(),
        );
    }

    if (seed !== undefined) {
        cliOptions.push(
            '--seed',
            seed.toString(),
        );
    }

    if (timeout !== undefined) {
        cliOptions.push(
            '--timeout',
            timeout.toString(),
        );
    }

    const playerFiles = competitors
        .map((competitors) => {
            const { playerFile } = competitors;

            return playerFile;
        });

    // **TODO:** game log parsing
    // exec(FILE_GAME_ENGINE, 'simulate', ...cliOptions, ...playerFiles);

    return null;
}
