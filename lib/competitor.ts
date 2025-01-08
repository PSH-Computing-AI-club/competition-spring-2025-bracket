import { join } from '@std/path';

import { doesPathExist } from './util.ts';

const DIRECTORY_COMPETITOR_REPOSITORIES = './competitors';

const FILE_PLAYER_JAVASCRIPT = './mod.js';

const FILE_PLAYER_TYPESCRIPT = './mod.ts';

export interface ICompetitorData {
    readonly name: string;

    readonly repository: string;
}

export interface ICompetitor {
    readonly name: string;

    readonly playerFile: string;

    readonly repository: URL;
}

export function transformCompetitorData(
    competitorManifest: ICompetitorData[],
): Promise<ICompetitor[]> {
    return Promise.all(
        competitorManifest
            .map(async (competitor) => {
                const { name, repository } = competitor;

                const repositoryURL = new URL(repository);

                const javascriptPlayerFile = join(
                    DIRECTORY_COMPETITOR_REPOSITORIES,
                    name,
                    FILE_PLAYER_JAVASCRIPT,
                );

                const typescriptPlayerFile = join(
                    DIRECTORY_COMPETITOR_REPOSITORIES,
                    name,
                    FILE_PLAYER_TYPESCRIPT,
                );

                const playerFile = await doesPathExist(typescriptPlayerFile)
                    ? typescriptPlayerFile
                    : javascriptPlayerFile;

                return {
                    name,
                    playerFile,
                    repository: repositoryURL,
                };
            }),
    );
}
