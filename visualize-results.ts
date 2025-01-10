import type { IRunResults } from './lib/results.ts';
import { FILE_RUN_LOG } from './lib/run.ts';

const jsonPayload = await Deno.readTextFile(FILE_RUN_LOG);
const runResults = JSON.parse(jsonPayload) as IRunResults;

console.log({ runResults });
