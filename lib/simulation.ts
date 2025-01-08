import type { ICompetitor } from './competitor.ts';
import { exec } from './util.ts';

const FILE_GAME_ENGINE = './.bin/dotsandboxes-linux';

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

type MessageKind =
    | 'MESSAGE_APPLIED_CAPTURE'
    | 'MESSAGE_PLACED_LINE'
    | 'MESSAGE_PLAYER_ERROR'
    | 'MESSAGE_PLAYER_FORFEIT'
    | 'MESSAGE_PLAYER_TIMEOUT'
    | 'MESSAGE_SESSION_END'
    | 'MESSAGE_SESSION_START'
    | 'MESSAGE_TURN_END'
    | 'MESSAGE_TURN_MOVE'
    | 'MESSAGE_TURN_START';

interface IAppliedCaptureArgs {
    readonly playerInitial: string;

    readonly x: number;

    readonly y: number;
}

interface IPlacedLineArgs {
    readonly playerInitial: string;

    readonly x: number;

    readonly y: number;
}

interface IPlayerErrorArgs {
    readonly playerInitial: string;

    readonly errorName: string;

    readonly errorMessage: string;

    readonly errorStack?: string;
}

interface IPlayerForfeitArgs {
    readonly playerInitial: string;
}

interface IPlayerTimeoutArgs {
    readonly playerInitial: string;
}

interface ISessionEndArgs {
    readonly scores: Record<string, number>;
}

interface ISessionStartArgs {
    readonly columns: number;

    readonly players: {
        readonly playerIdentifier: string;

        readonly playerInitial: string;
    }[];

    readonly rows: number;
}

interface ITurnEndArgs {
    readonly capturesMade: number;

    readonly playerInitial: string;

    readonly turnIndex: number;
}

interface ITurnMoveArgs {
    readonly playerInitial: string;

    readonly x: number;

    readonly y: number;

    readonly turnIndex: number;
}

interface ITurnStartArgs {
    readonly playerInitial: string;

    readonly turnIndex: number;
}

type IGameLogArgs =
    | IAppliedCaptureArgs
    | IPlacedLineArgs
    | IPlayerForfeitArgs
    | IPlayerTimeoutArgs
    | ISessionEndArgs
    | ISessionStartArgs
    | ITurnEndArgs
    | IPlayerErrorArgs
    | ITurnMoveArgs
    | ITurnStartArgs;

interface IBaseMessage {
    readonly args: IGameLogArgs;

    readonly datetime: string;

    readonly level: 'CRITICAL' | 'DEBUG' | 'ERROR' | 'INFO' | 'WARN';

    readonly message: MessageKind;
}

interface IAppliedCaptureMessage extends IBaseMessage {
    readonly args: IAppliedCaptureArgs;

    readonly message: typeof MESSAGE_KIND.appliedCapture;
}

interface IPlacedLineMessage extends IBaseMessage {
    readonly args: IPlacedLineArgs;

    readonly message: typeof MESSAGE_KIND.placedLine;
}

interface IPlayerErrorMessage extends IBaseMessage {
    readonly args: IPlayerErrorArgs;

    readonly message: typeof MESSAGE_KIND.playerError;
}

interface IPlayerForfeitMessage extends IBaseMessage {
    readonly args: IPlayerForfeitArgs;

    readonly message: typeof MESSAGE_KIND.playerForfeit;
}

interface IPlayerTimeoutMessage extends IBaseMessage {
    readonly args: IPlayerTimeoutArgs;

    readonly message: typeof MESSAGE_KIND.playerTimeout;
}

interface ISessionEndMessage extends IBaseMessage {
    readonly args: ISessionEndArgs;

    readonly message: typeof MESSAGE_KIND.sessionEnd;
}

interface ISessionStartMessage extends IBaseMessage {
    readonly args: ISessionStartArgs;

    readonly message: typeof MESSAGE_KIND.sessionStart;
}

interface ITurnEndMessage extends IBaseMessage {
    readonly args: ITurnEndArgs;

    readonly message: typeof MESSAGE_KIND.turnEnd;
}

interface ITurnMoveMessage extends IBaseMessage {
    readonly args: ITurnMoveArgs;

    readonly message: typeof MESSAGE_KIND.turnMove;
}

interface ITurnStartMessage extends IBaseMessage {
    readonly args: ITurnStartArgs;

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
        '--output-path',
        logFilePath,
        '--output-kind',
        'jsonl',
        ...cliOptions,
        ...playerFiles,
    );

    const logText = Deno.readTextFile(logFilePath);
    const eventLog = JSON.parse(`[${logText}]`);

    return null;
}
