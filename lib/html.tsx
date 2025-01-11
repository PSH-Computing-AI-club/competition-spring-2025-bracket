import type { ComponentChildren } from 'preact';

const TEXT_STYLE = await Deno.readTextFile('./lib/style.css');

interface IDocumentProps {
    readonly children: ComponentChildren;
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

function Style() {
    return (
        <style
            dangerouslySetInnerHTML={{ __html: TEXT_STYLE }}
        />
    );
}

function Document(props: IDocumentProps) {
    const { children } = props;

    return (
        <html lang='en'>
            <head>
                <meta charset='UTF-8' />
                <meta
                    name='viewport'
                    content='width=device-width, initial-scale=1.0'
                />

                <title>
                    Bracket :: Spring '25 Blossoming Battlegrounds — PSH
                    Computing & AI Club
                </title>

                <Style />
            </head>

            <body>
                {children}
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

export function BracketView() {
    const ROUND1 = [
        { pA: 'Team 1', pB: 'Team 2', winner: 'Team 1' },
        { pA: 'Team 3', pB: 'Team 4', winner: 'Team 4' },
        { pA: 'Team 5', pB: 'Team 6', winner: 'Team 6' },
        { pA: 'Team 7', pB: 'Team 8', winner: 'Team 7' },
    ];

    const ROUND2 = [
        { pA: 'Team 1', pB: 'Team 4', winner: 'Team 1' },
        { pA: 'Team 6', pB: 'Team 7', winner: 'Team 6' },
    ];

    const ROUND3 = [
        { pA: 'Team 1', pB: 'Team 6', winner: 'Team 1' },
    ];

    const ROUNDS = [ROUND1, ROUND2, ROUND3];

    return (
        <Document>
            <header>
                <h1>
                    Spring '25 Blossoming Battlegrounds
                </h1>
            </header>

            <main>
                <Bracket>
                    {ROUNDS.map((pairs) => {
                        return (
                            <BracketRound>
                                {pairs.map((pair, index) => {
                                    const { pA, pB, winner } = pair;

                                    return (
                                        <>
                                            {index !== 0
                                                ? <BracketSpacer />
                                                : undefined}

                                            <BracketCompetitor
                                                competitor={pA}
                                                isWinner={winner === pA}
                                            />

                                            <BracketSpacer isPairSpacer />

                                            <BracketCompetitor
                                                competitor={pB}
                                                isWinner={winner === pB}
                                                isBottomCompetitor
                                            />
                                        </>
                                    );
                                })}
                            </BracketRound>
                        );
                    })}
                </Bracket>
            </main>
        </Document>
    );
}
