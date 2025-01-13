const [TIMEZONE, TIMESTAMP_START, TIMESTAMP_END] = Deno.args;

const DATE_NOW = Temporal
    .Now
    .zonedDateTimeISO(TIMEZONE);

const DATE_END = Temporal
    .PlainDate
    .from(TIMESTAMP_END)
    .toZonedDateTime(TIMEZONE);

const DATE_START = Temporal
    .PlainDate
    .from(TIMESTAMP_START)
    .toZonedDateTime(TIMEZONE);

function isDateLessThan(
    dateA: Temporal.ZonedDateTime,
    dateB: Temporal.ZonedDateTime,
): boolean {
    // **HACK:** Deno does not yet implement the `Temporal.ZonedDateTime.compare`
    // API. So we have to polyfill something similar for our purposes.

    const duration = dateB.until(dateA);

    return duration.total({ unit: 'milliseconds' }) <= 0;
}

const IS_IN_RANGE = isDateLessThan(DATE_START, DATE_NOW) &&
    isDateLessThan(DATE_NOW, DATE_END);

Deno.exit(IS_IN_RANGE ? 0 : 1);
