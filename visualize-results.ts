import { FILE_RUN_LOG } from './lib/run.ts';
import type { IRunResults } from './lib/results.ts';

const jsonPayload = await Deno.readTextFile(FILE_RUN_LOG);
const runResults = JSON.parse(jsonPayload) as IRunResults;

console.log({ runResults });
