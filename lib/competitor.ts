import { join } from '@std/path';
import slug from 'slug';

import { doesPathExist } from './util.ts';

const DIRECTORY_COMPETITOR_REPOSITORIES = './competitors';

const FILE_PLAYER_JAVASCRIPT = './mod.js';

const FILE_PLAYER_TYPESCRIPT = './mod.ts';

export interface ICompetitorData {
    readonly name: string;

    readonly repository: string;
}

export interface ICompetitor {
    readonly identifier: string;

    readonly name: string;

    readonly playerFile: string;

    readonly repository: URL;

    readonly repositoryDirectory: string;
}

export function transformCompetitorData(
    competitorManifest: ICompetitorData[],
): Promise<ICompetitor[]> {
    return Promise.all(
        competitorManifest
            .map(async (competitor) => {
                const { name, repository } = competitor;

                const identifier = slug(name) as string;
                const repositoryURL = new URL(repository);

                const repositoryDirectory = join(
                    DIRECTORY_COMPETITOR_REPOSITORIES,
                    identifier,
                );

                const javascriptPlayerFile = join(
                    repositoryDirectory,
                    FILE_PLAYER_JAVASCRIPT,
                );

                const typescriptPlayerFile = join(
                    repositoryDirectory,
                    FILE_PLAYER_TYPESCRIPT,
                );

                const playerFile = await doesPathExist(typescriptPlayerFile)
                    ? typescriptPlayerFile
                    : javascriptPlayerFile;

                return {
                    identifier,
                    name,
                    playerFile,
                    repository: repositoryURL,
                    repositoryDirectory,
                };
            }),
    );
}
