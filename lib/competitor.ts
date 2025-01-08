import { join } from '@std/path';

import { exec } from './util.ts';

const DIRECTORY_COMPETITOR_REPOSITORIES = './competitors';

const FILE_COMPETITOR_PLAYER = './mod.js';

const FILE_GAME_ENGINE = './.bin/dotsandboxes-linux';

export interface ICompetitorData {
    readonly name: string;

    readonly repository: string;
}

export interface ICompetitor {
    readonly name: string;

    readonly playerFile: string;

    readonly repository: URL;
}

export interface ISimulateCompetitorsOptions {
    readonly gridColumns?: number;

    readonly gridRows?: number;

    readonly seed?: number;

    readonly timeout?: number;
}

export async function simulateCompetitors(
    options: ISimulateCompetitorsOptions,
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

export function transformCompetitorData(
    competitorManifest: ICompetitorData[],
): ICompetitor[] {
    return competitorManifest
        .map((competitor) => {
            const { name, repository } = competitor;

            const repositoryURL = new URL(repository);

            const playerFile = join(
                DIRECTORY_COMPETITOR_REPOSITORIES,
                name,
                FILE_COMPETITOR_PLAYER,
            );

            return {
                name,
                playerFile,
                repository: repositoryURL,
            };
        });
}
