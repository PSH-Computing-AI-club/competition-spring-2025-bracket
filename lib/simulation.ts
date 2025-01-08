import type { ICompetitor } from './competitor.ts';
import { exec } from './util.ts';

const FILE_GAME_ENGINE = './.bin/dotsandboxes-linux';

const UTF16_CODE_LETTER_A = 'A'.charCodeAt(0);

const MESSAGE_KIND = {
    appliedCapture: 'MESSAGE_APPLIED_CAPTURE',

    placedLine: 'MESSAGE_PLACED_LINE',

    playerError: 'MESSAGE_PLAYER_ERROR',

    playerForfeit: 'MESSAGE_PLAYER_FORFEIT',

    playerTimeout: 'MESSAGE_PLAYER_TIMEOUT',

    sessionEnd: 'MESSAGE_SESSION_END',

    sessionStart: 'MESSAGE_SESSION_START',

    turnEnd: 'MESSAGE_TURN_END',

    turnMove: 'MESSAGE_TURN_MOVE',

    turnStart: 'MESSAGE_TURN_START',
} as const;

type LevelName = 'CRITICAL' | 'DEBUG' | 'ERROR' | 'INFO' | 'WARN';

interface IAppliedCaptureMessage {
    readonly args: {
        readonly playerInitial: string;

        readonly x: number;

        readonly y: number;
    };

    readonly datetime: string;

    readonly level: LevelName;

    readonly message: typeof MESSAGE_KIND.appliedCapture;
}

interface IPlacedLineMessage {
    readonly args: {
        readonly playerInitial: string;

        readonly x: number;

        readonly y: number;
    };

    readonly datetime: string;

    readonly level: LevelName;

    readonly message: typeof MESSAGE_KIND.placedLine;
}

interface IPlayerErrorMessage {
    readonly args: {
        readonly playerInitial: string;

        readonly errorName: string;

        readonly errorMessage: string;

        readonly errorStack?: string;
    };

    readonly datetime: string;

    readonly level: LevelName;

    readonly message: typeof MESSAGE_KIND.playerError;
}

interface IPlayerForfeitMessage {
    readonly args: {
        readonly playerInitial: string;
    };

    readonly datetime: string;

    readonly level: LevelName;

    readonly message: typeof MESSAGE_KIND.playerForfeit;
}

interface IPlayerTimeoutMessage {
    readonly args: {
        readonly playerInitial: string;
    };

    readonly datetime: string;

    readonly level: LevelName;

    readonly message: typeof MESSAGE_KIND.playerTimeout;
}

interface ISessionEndMessage {
    readonly args: {
        readonly scores: Record<string, number>;
    };

    readonly datetime: string;

    readonly level: LevelName;

    readonly message: typeof MESSAGE_KIND.sessionEnd;
}

interface ISessionStartMessage {
    readonly args: {
        readonly columns: number;

        readonly players: {
            readonly playerIdentifier: string;

            readonly playerInitial: string;
        }[];

        readonly rows: number;
    };
    readonly datetime: string;

    readonly level: LevelName;

    readonly message: typeof MESSAGE_KIND.sessionStart;
}

interface ITurnEndMessage {
    readonly args: {
        readonly capturesMade: number;

        readonly playerInitial: string;

        readonly turnIndex: number;
    };

    readonly datetime: string;

    readonly level: LevelName;

    readonly message: typeof MESSAGE_KIND.turnEnd;
}

interface ITurnMoveMessage {
    readonly args: {
        readonly playerInitial: string;

        readonly x: number;

        readonly y: number;

        readonly turnIndex: number;
    };

    readonly datetime: string;

    readonly level: LevelName;

    readonly message: typeof MESSAGE_KIND.turnMove;
}

interface ITurnStartMessage {
    readonly args: {
        readonly playerInitial: string;

        readonly turnIndex: number;
    };

    readonly datetime: string;

    readonly level: LevelName;

    readonly message: typeof MESSAGE_KIND.turnStart;
}

type IGameLogMessage =
    | IAppliedCaptureMessage
    | IPlacedLineMessage
    | IPlayerForfeitMessage
    | IPlayerTimeoutMessage
    | ISessionEndMessage
    | ISessionStartMessage
    | ITurnEndMessage
    | IPlayerErrorMessage
    | ITurnMoveMessage
    | ITurnStartMessage;

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

    const logFilePath = await Deno.makeTempFile({
        prefix: 'SIMULATION_',
    });

    exec(
        FILE_GAME_ENGINE,
        'simulate',
        '--output-file',
        logFilePath,
        '--output-kind',
        'jsonl',
        ...cliOptions,
        ...playerFiles,
    );

    const logText = Deno.readTextFile(logFilePath);
    const eventLog = JSON.parse(`[${logText}]`) as IGameLogMessage[];

    const competitorsWhoErrored = new Set<string>();
    const competitorScores: Record<string, number> = {};

    for (const message of eventLog) {
        const { message: messageKind } = message;

        switch (messageKind) {
            case MESSAGE_KIND.playerError:
            case MESSAGE_KIND.playerForfeit:
            case MESSAGE_KIND.playerTimeout: {
                const { playerInitial } = message.args;

                const competitorIndex = UTF16_CODE_LETTER_A -
                    playerInitial.charCodeAt(0);

                const competitor = competitors[competitorIndex];
                const { name } = competitor;

                competitorsWhoErrored.add(name);
                break;
            }

            case MESSAGE_KIND.sessionEnd: {
                const { scores } = message.args;

                for (const playerInitial in scores) {
                    const score = scores[playerInitial];
                    const competitorIndex = UTF16_CODE_LETTER_A -
                        playerInitial.charCodeAt(0);

                    const competitor = competitors[competitorIndex];
                    const { name } = competitor;

                    competitorScores[name] = score;
                }

                break;
            }
        }
    }

    const winningCompetitors = new Set<ICompetitor>();
    let highestScore: number = -1;

    for (const competitor of competitors) {
        const { name } = competitor;
        const score = competitorScores[name];

        if (highestScore < score) {
            winningCompetitors.clear();

            highestScore = score;
            winningCompetitors.add(competitor);
        } else if (highestScore === score) winningCompetitors.add(competitor);
    }

    if (highestScore > 0 && winningCompetitors.size === 1) {
        const [winningCompetitor] = winningCompetitors.values();

        return winningCompetitor;
    }

    return null;
}
