import type { ComponentChildren, JSX } from 'preact';
import { render } from 'preact-render-to-string/jsx';

import * as ICONS from './icons.tsx';
import type { IRunResults } from './results.ts';

const HEADER_DOCTYPE = '<!DOCTYPE html>\n';

const TEXT_STYLE = await Deno.readTextFile('./lib/style.css');

interface IDocumentProps {
    readonly children: ComponentChildren;

    readonly datetime: number;

    readonly runNumber?: number;

    readonly title: string;
}

interface IBracketCompetitorProps {
    readonly competitor: string;

    readonly isCompetitorA?: boolean;

    readonly isFirstPlace?: boolean;

    readonly isSecondPlace?: boolean;

    readonly isSupplementalBracket?: boolean;

    readonly isThirdPlace?: boolean;

    readonly isWinner?: boolean;
}

interface IBracketSpacerProps {
    readonly isPairSpacer?: boolean;
}

interface IBracketRoundProps {
    readonly children: ComponentChildren;
}

interface IBracketProps {
    readonly children: ComponentChildren;
}

export interface IBracketViewProps {
    readonly runResults: IRunResults;
}

export interface IDirectoryViewProps {
    readonly directory: string;

    readonly entries: Deno.DirEntry[];
}

function Style() {
    return (
        <style
            dangerouslySetInnerHTML={{ __html: TEXT_STYLE }}
        />
    );
}

function Document(props: IDocumentProps) {
    const { children, datetime, runNumber, title } = props;

    const instant = Temporal.Instant.fromEpochMilliseconds(datetime);
    const plainDate = instant
        .toZonedDateTimeISO('America/New_York')
        .toPlainDate();

    // **HACK:** Deno's i18n backend does not respect that we are excluding the
    // year in our formatting options. So, we need to manually remove it.
    //
    // We are expecting to get a value like "Jan 11, 2025". And then split it
    // by the commma to then finally get the first element of that split.
    //
    // THIS MAY BREAK across i18n backends! i.e. different JavaScript runtimes or
    // future Deno / V8 versions.

    const [formattedDate] = plainDate
        .toLocaleString('en-US', {
            month: 'short',
            day: '2-digit',
        })
        .split(',');

    return (
        <html lang='en'>
            <head>
                <meta charset='UTF-8' />
                <meta
                    name='viewport'
                    content='width=device-width, initial-scale=1.0'
                />

                <title>
                    {title}{' '}
                    :: Spring '25 Blossoming Battlegrounds — PSH Computing & AI
                    Club
                </title>

                <Style />
            </head>

            <body>
                <header>
                    <h3>Spring '25</h3>
                    <h1>Blossoming Battlegrounds</h1>
                    <h2>
                        {title}
                        {runNumber !== undefined
                            ? (
                                <>
                                    {' '}— <br />
                                    RUN {runNumber}, {formattedDate}
                                </>
                            )
                            : <></>}
                    </h2>
                </header>

                <main>
                    {children}
                </main>
            </body>
        </html>
    );
}

function BracketCompetitor(props: IBracketCompetitorProps) {
    const {
        competitor,
        isCompetitorA,
        isFirstPlace,
        isSecondPlace,
        isSupplementalBracket,
        isThirdPlace,
        isWinner,
    } = props;

    let statusIcon = ICONS.X;

    if (isFirstPlace || isSecondPlace || isThirdPlace) {
        statusIcon = ICONS.Trophy;
    } else if (isSupplementalBracket) statusIcon = ICONS.Swords;
    else if (isWinner) statusIcon = ICONS.Check;

    return (
        <div
            class='bracket--competitor'
            data-is-competitor-a={isCompetitorA ? 'true' : undefined}
            data-is-competitor-b={isCompetitorA ? undefined : 'true'}
            data-is-loser={isWinner ? undefined : 'true'}
            data-is-first-place={isFirstPlace ? 'true' : undefined}
            data-is-second-place={isSecondPlace ? 'true' : undefined}
            data-is-supplemental-bracket={isSupplementalBracket
                ? 'true'
                : undefined}
            data-is-third-place={isThirdPlace ? 'true' : undefined}
            data-is-winner={isWinner ? 'true' : undefined}
        >
            <span class='bracket--competitor-text'>
                {competitor}
            </span>

            {statusIcon({ className: 'bracket--competitor-icon' })}
        </div>
    );
}

function BracketSpacer(props: IBracketSpacerProps) {
    const { isPairSpacer } = props;

    return (
        <div
            class='bracket--spacer'
            data-is-pair-spacer={isPairSpacer ? 'true' : undefined}
        >
            &nbsp;
        </div>
    );
}

function BracketRound(props: IBracketRoundProps) {
    const { children } = props;

    return (
        <div class='bracket--round'>
            {children}
        </div>
    );
}

function Bracket(props: IBracketProps) {
    const { children } = props;

    return (
        <div class='bracket'>
            {children}
        </div>
    );
}

export function BracketView(props: IBracketViewProps) {
    const { runResults } = props;
    const {
        competitors,
        datetime,
        rounds,
        runNumber,
        firstPlace,
        secondPlace,
        thirdPlace,
        thirdPlacePair,
    } = runResults;

    const nameLookup = Object.fromEntries(
        competitors.map((competitor) => {
            const { identifier, name } = competitor;

            return [identifier, name];
        }),
    );

    const firstPlaceName = nameLookup[firstPlace];
    const thirdPlaceName = nameLookup[thirdPlace];

    const { competitorA: thirdPlaceA, competitorB: thirdPlaceB } =
        thirdPlacePair;

    return (
        <Document
            title='Bracket'
            datetime={datetime}
            runNumber={runNumber}
        >
            <h4>Main Bracket</h4>

            <Bracket>
                {rounds.map((round, roundIndex) => {
                    const { pairs } = round;

                    return (
                        <BracketRound>
                            {pairs.map((pair, pairIndex) => {
                                const { competitorA, competitorB, winner } =
                                    pair;

                                const nameA = nameLookup[competitorA];
                                const nameB = nameLookup[competitorB];

                                const isASecondPlace = (roundIndex ===
                                        rounds.length - 1)
                                    ? (secondPlace === competitorA)
                                    : undefined;

                                const isBSecondPlace = (roundIndex ===
                                        rounds.length - 1)
                                    ? (secondPlace === competitorB)
                                    : undefined;

                                const isASupplementalBracket = (roundIndex ===
                                        rounds.length - 2)
                                    ? (thirdPlaceA === competitorA ||
                                        thirdPlaceB === competitorA)
                                    : undefined;

                                const isBSupplementalBracket = (roundIndex ===
                                        rounds.length - 2)
                                    ? (thirdPlaceB === competitorB ||
                                        thirdPlaceA === competitorB)
                                    : undefined;

                                return (
                                    <>
                                        {pairIndex !== 0
                                            ? <BracketSpacer />
                                            : undefined}

                                        <BracketCompetitor
                                            competitor={nameA}
                                            isSecondPlace={isASecondPlace}
                                            isSupplementalBracket={isASupplementalBracket}
                                            isWinner={winner ===
                                                competitorA}
                                            isCompetitorA
                                        />

                                        <BracketSpacer isPairSpacer />

                                        <BracketCompetitor
                                            competitor={nameB}
                                            isSecondPlace={isBSecondPlace}
                                            isSupplementalBracket={isBSupplementalBracket}
                                            isWinner={winner ===
                                                competitorB}
                                        />
                                    </>
                                );
                            })}
                        </BracketRound>
                    );
                })}

                <BracketRound>
                    <BracketCompetitor
                        competitor={firstPlaceName}
                        isCompetitorA
                        isFirstPlace
                        isWinner
                    />
                </BracketRound>
            </Bracket>

            <h4>3rd Place Bracket</h4>

            <Bracket>
                <BracketRound>
                    {[thirdPlacePair].map((pair, pairIndex) => {
                        const { competitorA, competitorB, winner } = pair;

                        const nameA = nameLookup[competitorA];
                        const nameB = nameLookup[competitorB];

                        return (
                            <>
                                {pairIndex !== 0
                                    ? <BracketSpacer />
                                    : undefined}

                                <BracketCompetitor
                                    competitor={nameA}
                                    isWinner={winner ===
                                        competitorA}
                                    isCompetitorA
                                />

                                <BracketSpacer isPairSpacer />

                                <BracketCompetitor
                                    competitor={nameB}
                                    isWinner={winner ===
                                        competitorB}
                                />
                            </>
                        );
                    })}
                </BracketRound>

                <BracketRound>
                    <BracketCompetitor
                        competitor={thirdPlaceName}
                        isCompetitorA
                        isThirdPlace
                        isWinner
                    />
                </BracketRound>
            </Bracket>

            <h4>Supplemental Materials</h4>

            <ul>
                <li>
                    <a
                        href='https://github.com/PSH-Computing-AI-club/competition-spring-2025'
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        Competition Overview
                    </a>
                </li>

                <li>
                    <a href='./logs' target='_blank'>Log Files</a>
                </li>
            </ul>
        </Document>
    );
}

export function DirectoryView(props: IDirectoryViewProps) {
    const { directory, entries } = props;

    const sortedEntries = entries.toSorted((entryA, entryB) => {
        const nameA = entryA.name.toLowerCase();
        const nameB = entryB.name.toLowerCase();

        return nameA < nameB ? -1 : 0;
    });

    const directoryEntries = sortedEntries.filter(
        (entry) => entry.isDirectory,
    );

    const fileEntries = sortedEntries.filter(
        (entry) => entry.isFile && entry.name !== 'index.html',
    );

    return (
        <html lang='en'>
            <head>
                <meta charset='UTF-8' />
                <meta
                    name='viewport'
                    content='width=device-width, initial-scale=1.0'
                />

                <title>
                    {directory} :: Directory Listing
                </title>
            </head>

            <body>
                <header>
                    <h1>
                        <code>{directory}/</code>
                    </h1>
                </header>

                <main>
                    <ul>
                        {directoryEntries.map((entry) => {
                            const { name } = entry;

                            return (
                                <li>
                                    <a href={`./${name}`}>
                                        <code>{entry.name}/</code>
                                    </a>
                                </li>
                            );
                        })}

                        {fileEntries.map((entry) => {
                            const { name } = entry;

                            return (
                                <li>
                                    <a href={`./${name}`}>
                                        <code>{entry.name}</code>
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </main>
            </body>
        </html>
    );
}

export function renderView(view: JSX.Element): string {
    const renderedComponent = render(view, {}, { pretty: true });

    return HEADER_DOCTYPE + renderedComponent;
}
