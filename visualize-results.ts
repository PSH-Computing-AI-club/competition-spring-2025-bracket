import { basename } from '@std/path';

import { BracketView, DirectoryView, renderView } from './lib/html.tsx';
import type { IRunResults } from './lib/results.ts';
import {
    DIRECTORY_MATCH_LOGS as DIRECTORY_RUN_MATCH_LOGS,
    FILE_RUN_LOG,
} from './lib/run.ts';
import { copyDirectoryFilesTo, copyFileTo } from './lib/util.ts';
import {
    DIRECTORY_BRACKET_LOGS,
    DIRECTORY_LOG_OUTPUT,
    DIRECTORY_MATCH_LOGS,
    DIRECTORY_WWW_OUTPUT,
    FILE_BRACKET_LOGS_INDEX,
    FILE_LOGS_INDEX,
    FILE_MATCH_LOGS_INDEX,
    FILE_WWW_INDEX,
} from './lib/www.ts';

await Promise.all([
    DIRECTORY_WWW_OUTPUT,
    DIRECTORY_BRACKET_LOGS,
    DIRECTORY_MATCH_LOGS,
]
    .map(
        (directory) => Deno.mkdir(directory, { recursive: true }),
    ));

const jsonPayload = await Deno.readTextFile(FILE_RUN_LOG);
const runResults = JSON.parse(jsonPayload) as IRunResults;

const bracketView = BracketView({ runResults });
const bracketIndex = renderView(bracketView);

await Deno.writeTextFile(FILE_WWW_INDEX, bracketIndex);

await Promise.all([
    copyFileTo(FILE_RUN_LOG, DIRECTORY_BRACKET_LOGS),
    copyDirectoryFilesTo(DIRECTORY_RUN_MATCH_LOGS, DIRECTORY_MATCH_LOGS),
]);

const [bracketEntries, logEntries, matchesEntries] = await Promise.all([
    Array.fromAsync(
        Deno.readDir(DIRECTORY_BRACKET_LOGS),
    ),

    Array.fromAsync(
        Deno.readDir(DIRECTORY_LOG_OUTPUT),
    ),

    Array.fromAsync(
        Deno.readDir(DIRECTORY_MATCH_LOGS),
    ),
]);

const bracketLogsView = DirectoryView({
    directory: basename(DIRECTORY_BRACKET_LOGS),
    entries: bracketEntries,
});

const logsOutputView = DirectoryView({
    directory: basename(DIRECTORY_LOG_OUTPUT),
    entries: logEntries,
});

const matchesLogsView = DirectoryView({
    directory: basename(DIRECTORY_MATCH_LOGS),
    entries: matchesEntries,
});

const bracketLogsIndex = renderView(bracketLogsView);
const logsOutputIndex = renderView(logsOutputView);
const matchesLogIndex = renderView(matchesLogsView);

await Promise.all([
    Deno.writeTextFile(FILE_BRACKET_LOGS_INDEX, bracketLogsIndex),
    Deno.writeTextFile(FILE_LOGS_INDEX, logsOutputIndex),
    Deno.writeTextFile(FILE_MATCH_LOGS_INDEX, matchesLogIndex),
]);
