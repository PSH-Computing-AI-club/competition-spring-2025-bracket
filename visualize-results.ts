import { renderToString } from 'preact-render-to-string';

import { Document } from './lib/html.tsx';
import type { IRunResults } from './lib/results.ts';
import { FILE_RUN_LOG } from './lib/run.ts';

const jsonPayload = await Deno.readTextFile(FILE_RUN_LOG);
const runResults = JSON.parse(jsonPayload) as IRunResults;

const document = Document();
const rendered = renderToString(document);

console.log({ rendered });
