const TEXT_STYLE = await Deno.readTextFile('./lib/style.css');

function Style() {
    return (
        <style
            dangerouslySetInnerHTML={{ __html: TEXT_STYLE }}
        />
    );
}

export function Document() {
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
                hello world
            </body>
        </html>
    );
}
