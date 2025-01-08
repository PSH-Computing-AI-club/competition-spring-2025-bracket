import { join } from '@std/path';

const DIRECTORY_COMPETITOR_REPOSITORIES = './competitors';

const FILE_COMPETITOR_PLAYER = './mod.js';

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
