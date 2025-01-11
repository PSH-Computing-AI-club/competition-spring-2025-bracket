import type { ComponentChildren } from 'preact';

import type { IRunResults } from './results.ts';

const TEXT_STYLE = await Deno.readTextFile('./lib/style.css');

interface IDocumentProps {
    readonly children: ComponentChildren;

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
    const { children, title } = props;

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
                    <h2>Spring '25</h2>
                    <h1>Blossoming Battlegrounds</h1>
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

    const statusIcon = isWinner ? '✔️' : '❌';

    return (
        <div
            class='bracket--competitor'
            data-is-bottom-competitor={isBottomCompetitor ? 'true' : undefined}
            data-is-winner={isWinner ? 'true' : undefined}
        >
            <span class='bracket--competitor-text'>
                {competitor}
                <span class='bracket--competitor-icon'>{statusIcon}</span>
            </span>
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
    const { competitors, rounds, firstPlace, thirdPlace, thirdPlacePair } =
        runResults;

    const nameLookup = Object.fromEntries(
        competitors.map((competitor) => {
            const { identifier, name } = competitor;

            return [identifier, name];
        }),
    );

    const firstPlaceName = nameLookup[firstPlace];
    const thirdPlaceName = nameLookup[thirdPlace];

    return (
        <Document title='Bracket'>
            <h3>Main Bracket</h3>

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

            <h3>3rd Place Bracket</h3>

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
