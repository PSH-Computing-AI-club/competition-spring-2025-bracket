const NOW = Temporal.Now.plainDateTimeISO();

const RUNS_PER_DAY = 6;

const HOURS_BETWEEN_RUNS = 24 / RUNS_PER_DAY;

const UNIX_EPOCH = Temporal.PlainDate.from({
    year: 1970,
    month: 1,
    day: 1,
});

export const RUN_NUMBER = Math.floor(NOW.hour / HOURS_BETWEEN_RUNS);

export const RUN_IDENTIFIER = `${NOW.year}-${
    NOW.month.toString().padStart(2, '0')
}-${NOW.day.toString().padStart(2, '0')}.${RUN_NUMBER}`;

export interface ICommandExecutionErrorOptions extends ErrorOptions {
    readonly code: number;

    readonly stderr: string;
}

export class CommandExecutionError extends Error {
    readonly code: number;

    override readonly cause: string;

    constructor(message: string, options: ICommandExecutionErrorOptions) {
        super(message, options);

        const { code, stderr } = options;

        this.name = CommandExecutionError.name;

        this.code = code;
        this.cause = stderr;
    }
}

export async function doesPathExist(path: string | URL): Promise<boolean> {
    try {
        await Deno.lstat(path);
    } catch (error) {
        if (error instanceof Deno.errors.NotFound) return false;

        throw error;
    }

    return true;
}

export async function exec(
    filePath: string,
    ...args: string[]
): Promise<string> {
    const command = new Deno.Command(filePath, {
        args,
    });

    const { code, stdout, stderr } = await command.output();
    const textDecoder = new TextDecoder();

    if (code !== 0) {
        const message = textDecoder.decode(stderr);

        throw new CommandExecutionError(
            `bad argument(s) #0,#1 to 'exec' (command returned non-zero status code '${code}')`,
            { code, stderr: message },
        );
    }

    return textDecoder.decode(stdout);
}

export function generateDaySeed(): bigint {
    const { nanoseconds } = Temporal
        .Now
        .plainDateISO()
        .since(UNIX_EPOCH)
        .round({
            largestUnit: 'nanoseconds',
        });

    return BigInt(nanoseconds);
}

export function pairElements<T>(array: T[]): T[][] {
    const pairs: T[][] = [];

    for (let elementIndex = 0; elementIndex < array.length; elementIndex += 2) {
        pairs.push([
            array[elementIndex],
            array[elementIndex + 1],
        ]);
    }

    return pairs;
}
