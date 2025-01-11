import type { ComponentChildren } from 'preact';

import * as ICONS from './icons.tsx';
import type { IRunResults } from './results.ts';

const TEXT_STYLE = await Deno.readTextFile('./lib/style.css');

interface IDocumentProps {
    readonly children: ComponentChildren;

    readonly datetime: number;

    readonly runNumber: number;

    readonly title: string;
}

interface IBracketCompetitorProps {
    readonly competitor: string;

    readonly isBottomCompetitor?: boolean;

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
                    <h2>{title} — RUN {runNumber}, {formattedDate}</h2>
                </header>

                <main>
                    {children}
                </main>
            </body>
        </html>
    );
}

function BracketCompetitor(props: IBracketCompetitorProps) {
    const { competitor, isBottomCompetitor, isWinner } = props;

    const statusIcon = isWinner ? ICONS.Check : ICONS.X;

    return (
        <div
            class='bracket--competitor'
            data-is-bottom-competitor={isBottomCompetitor ? 'true' : undefined}
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

    return (
        <Document
            title='Bracket'
            datetime={datetime}
            runNumber={runNumber}
        >
            <h4>Main Bracket</h4>

            <Bracket>
                {rounds.map((round) => {
                    const { pairs } = round;

                    return (
                        <BracketRound>
                            {pairs.map((pair, index) => {
                                const { competitorA, competitorB, winner } =
                                    pair;

                                const nameA = nameLookup[competitorA];
                                const nameB = nameLookup[competitorB];

                                return (
                                    <>
                                        {index !== 0
                                            ? <BracketSpacer />
                                            : undefined}

                                        <BracketCompetitor
                                            competitor={nameA}
                                            isWinner={winner ===
                                                competitorA}
                                        />

                                        <BracketSpacer isPairSpacer />

                                        <BracketCompetitor
                                            competitor={nameB}
                                            isWinner={winner ===
                                                competitorB}
                                            isBottomCompetitor
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
                        isWinner
                    />
                </BracketRound>
            </Bracket>

            <h4>3rd Place Bracket</h4>

            <Bracket>
                <BracketRound>
                    {[thirdPlacePair].map((pair, index) => {
                        const { competitorA, competitorB, winner } = pair;

                        const nameA = nameLookup[competitorA];
                        const nameB = nameLookup[competitorB];

                        return (
                            <>
                                {index !== 0 ? <BracketSpacer /> : undefined}

                                <BracketCompetitor
                                    competitor={nameA}
                                    isWinner={winner ===
                                        competitorA}
                                />

                                <BracketSpacer isPairSpacer />

                                <BracketCompetitor
                                    competitor={nameB}
                                    isWinner={winner ===
                                        competitorB}
                                    isBottomCompetitor
                                />
                            </>
                        );
                    })}
                </BracketRound>

                <BracketRound>
                    <BracketCompetitor
                        competitor={thirdPlaceName}
                        isWinner
                    />
                </BracketRound>
            </Bracket>
        </Document>
    );
}
