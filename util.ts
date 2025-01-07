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
