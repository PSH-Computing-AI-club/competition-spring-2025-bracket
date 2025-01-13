import { render } from 'preact-render-to-string/jsx';

import { BracketView, HEADER_DOCTYPE } from './lib/html.tsx';
import type { IRunResults } from './lib/results.ts';
import { FILE_RUN_LOG } from './lib/run.ts';
import { DIRECTORY_WWW_OUTPUT, FILE_WWW_LANDING_INDEX } from './lib/www.ts';

await Deno.mkdir(DIRECTORY_WWW_OUTPUT, { recursive: true });

const jsonPayload = await Deno.readTextFile(FILE_RUN_LOG);
const runResults = JSON.parse(jsonPayload) as IRunResults;

const view = BracketView({ runResults });
const landingIndex = HEADER_DOCTYPE + render(view, {}, { pretty: true });

await Deno.writeTextFile(FILE_WWW_LANDING_INDEX, landingIndex);
