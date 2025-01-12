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
            xmlns='http://www.w3.org/2000/svg'
            class={`lucide lucide-check ${className}`}
            width='1.25em'
            height='1.25em'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            stroke-width='2'
            stroke-linecap='square'
            stroke-linejoin='bevel'
        >
            <path d='M20 6 9 17l-5-5' />
        </svg>
    );
}

export function Trophy(props: IIconProps = {}) {
    const { className = '' } = props;

    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            class={`lucide lucide-medal ${className}`}
            width='1.25em'
            height='1.25em'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            stroke-width='2'
            stroke-linecap='square'
            stroke-linejoin='bevel'
        >
            <path d='M6 9H4.5a2.5 2.5 0 0 1 0-5H6' />
            <path d='M18 9h1.5a2.5 2.5 0 0 0 0-5H18' />
            <path d='M4 22h16' />
            <path d='M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22' />
            <path d='M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22' />
            <path d='M18 2H6v7a6 6 0 0 0 12 0V2Z' />
        </svg>
    );
}

export function X(props: IIconProps = {}) {
    const { className = '' } = props;

    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            class={`lucide lucide-x ${className}`}
            width='1.25em'
            height='1.25em'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            stroke-width='2'
            stroke-linecap='square'
            stroke-linejoin='bevel'
        >
            <path d='M18 6 6 18' />
            <path d='m6 6 12 12' />
        </svg>
    );
}
