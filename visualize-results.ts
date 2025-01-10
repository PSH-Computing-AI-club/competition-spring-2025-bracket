import { render } from 'preact-render-to-string/jsx';

import { Document } from './lib/html.tsx';
import type { IRunResults } from './lib/results.ts';
import { FILE_RUN_LOG } from './lib/run.ts';

const HEADER_DOCTYPE = '<!DOCTYPE html>\n';

const jsonPayload = await Deno.readTextFile(FILE_RUN_LOG);
const runResults = JSON.parse(jsonPayload) as IRunResults;

const document = Document();
const rendered = render(document, {}, { pretty: true });

console.log(HEADER_DOCTYPE + rendered);
