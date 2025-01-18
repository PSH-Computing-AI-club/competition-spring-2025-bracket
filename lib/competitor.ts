import slug from 'slug';
import { join } from '@std/path';

import { doesPathExist } from './util.ts';

export const DIRECTORY_COMPETITOR_REPOSITORIES = './competitors';

export const FILE_PLAYER_JAVASCRIPT = './mod.js';

export const FILE_PLAYER_TYPESCRIPT = './mod.ts';

export interface ICompetitorData {
    readonly name: string;

    readonly url: string;
}

export interface ICompetitor {
    readonly cloneDirectory: string;

    readonly identifier: string;

    readonly name: string;

    readonly playerFile: string;

    readonly url: URL;
}

export function transformCompetitorData(
    competitorManifest: ICompetitorData[],
): Promise<ICompetitor[]> {
    return Promise.all(
        competitorManifest
            .map(async (competitor) => {
                const { name, url } = competitor;

                const identifier = slug(name) as string;
                const repositoryURL = new URL(url);

                const cloneDirectory = join(
                    DIRECTORY_COMPETITOR_REPOSITORIES,
                    identifier,
                );

                const javascriptPlayerFile = join(
                    cloneDirectory,
                    FILE_PLAYER_JAVASCRIPT,
                );

                const typescriptPlayerFile = join(
                    cloneDirectory,
                    FILE_PLAYER_TYPESCRIPT,
                );

                const playerFile = await doesPathExist(typescriptPlayerFile)
                    ? typescriptPlayerFile
                    : javascriptPlayerFile;

                return {
                    cloneDirectory,
                    identifier,
                    name,
                    playerFile,
                    url: repositoryURL,
                };
            }),
    );
}
