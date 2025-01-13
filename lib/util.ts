import { basename, join } from '@std/path';

export interface ICommandExecutionResults {
    readonly stderr: string;

    readonly stdout: string;
}

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

export function copyFileTo(
    filePath: string,
    directoryPath: string,
): Promise<void> {
    const fileName = basename(filePath);
    const copyFilePath = join(directoryPath, fileName);

    return Deno.copyFile(filePath, copyFilePath);
}

export async function copyDirectoryFilesTo(
    fromDirectoryPath: string,
    toDirectoryPath: string,
): Promise<void> {
    const filePaths = (await Array
        .fromAsync(Deno.readDir(fromDirectoryPath)))
        .filter(
            (entry) => entry.isFile,
        )
        .map(
            (entry) => join(fromDirectoryPath, entry.name),
        );

    await Promise.all(
        filePaths.map(
            (filePath) => copyFileTo(filePath, toDirectoryPath),
        ),
    );
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
): Promise<ICommandExecutionResults> {
    const command = new Deno.Command(filePath, {
        args,
    });

    const { code, stderr, stdout } = await command.output();

    const textDecoder = new TextDecoder();
    const stderrMessage = textDecoder.decode(stderr);

    if (code !== 0) {
        throw new CommandExecutionError(
            `bad argument(s) #0,#1 to 'exec' (command returned non-zero status code '${code}')`,
            { code, stderr: stderrMessage },
        );
    }

    const stdoutMessage = textDecoder.decode(stdout);

    return {
        stderr: stderrMessage,
        stdout: stdoutMessage,
    };
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
