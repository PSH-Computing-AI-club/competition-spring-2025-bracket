// SOURCE: https://lucide.dev
//
// ISC LICENSE:
//
// Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part
// of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors
// 2022.
//
// Permission to use, copy, modify, and/or distribute this software for any purpose
// with or without fee is hereby granted, provided that the above copyright notice
// and this permission notice appear in all copies.
//
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
// REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT,
// OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE,
// DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS
// ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

export interface IIconProps {
    readonly className?: string;
}

export function Check(props: IIconProps = {}) {
    const { className = '' } = props;

    return (
        <svg
            class={`lucide lucide-check ${className}`}
            width='1.25em'
            height='1.25em'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            stroke-width='3'
            stroke-linecap='square'
            stroke-linejoin='bevel'
        >
            <path d='M20 6 9 17l-5-5' />
        </svg>
    );
}

export function Medal(props: IIconProps = {}) {
    const { className = '' } = props;

    return (
        <svg
            class={`lucide lucide-medal ${className}`}
            xmlns='http://www.w3.org/2000/svg'
            width='1.25em'
            height='1.25em'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            stroke-width='3'
            stroke-linecap='square'
            stroke-linejoin='bevel'
        >
            <path d='M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15' />
            <path d='M11 12 5.12 2.2' />
            <path d='m13 12 5.88-9.8' />
            <path d='M8 7h8' />
            <circle cx='12' cy='17' r='5' />
            <path d='M12 18v-2h-.5' />
        </svg>
    );
}

export function X(props: IIconProps = {}) {
    const { className = '' } = props;

    return (
        <svg
            class={`lucide lucide-x ${className}`}
            width='1.25em'
            height='1.25em'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            stroke-width='3'
            stroke-linecap='square'
            stroke-linejoin='bevel'
        >
            <path d='M18 6 6 18' />
            <path d='m6 6 12 12' />
        </svg>
    );
}
