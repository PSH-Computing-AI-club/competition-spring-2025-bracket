import { join } from '@std/path';

const DIRECTORY_COMPETITOR_REPOSITORIES = './competitors';

const FILE_COMPETITOR_PLAYER = './mod.js';

export interface ICompetitorData {
    readonly name: string;

    readonly repository: string;
}

export interface ICompetitor {
    readonly filePath: string;

    readonly name: string;

    readonly repository: URL;
}

export async function cloneCompetitorRepositories(
    competitors: ICompetitor[],
): Promise<void> {
    await Promise.all(
        competitors
            .map(async (competitor) => {
                const { repository } = competitor;

                // **TODO:** git clone their repositories

                // return exec('git', 'clone', repository.toString());
            }),
    );
}

export function transformCompetitorData(
    competitorManifest: ICompetitorData[],
): ICompetitor[] {
    return competitorManifest
        .map((competitor) => {
            const { name, repository } = competitor;

            const repositoryURL = new URL(repository);

            const filePath = join(
                DIRECTORY_COMPETITOR_REPOSITORIES,
                name,
                FILE_COMPETITOR_PLAYER,
            );

            return {
                filePath,
                name,
                repository: repositoryURL,
            };
        });
}
