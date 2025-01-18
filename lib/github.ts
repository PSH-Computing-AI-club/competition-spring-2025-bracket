import { App } from '@octokit/app';
import { createAppAuth } from '@octokit/auth-app';

export interface IGetAppInstallationTokensOptions {
    readonly allowedAccounts?: string[];

    readonly appID: string;

    readonly privateKey: string;
}

export async function fetchAppInstallationTokens(
    options: IGetAppInstallationTokensOptions,
): Promise<Record<string, string>> {
    const { allowedAccounts, appID, privateKey } = options;

    const tokens: [string, string][] = [];

    const app = new App({
        appId: appID,
        privateKey,
    });

    const appAuth = createAppAuth({
        appId: appID,
        privateKey,
    });

    await app.eachInstallation(async (options) => {
        const { installation } = options;

        const { account, id } = installation;
        const { login } = account!;

        if (allowedAccounts !== undefined && !allowedAccounts.includes(login)) {
            return;
        }

        const { token } = await appAuth({
            type: 'installation',
            installationId: id,
        });

        tokens.push([
            login,
            token,
        ]);
    });

    return Object.fromEntries(tokens);
}
