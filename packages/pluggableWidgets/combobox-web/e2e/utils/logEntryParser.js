/**
 * Helper for parsing onChange log output produced by the test project's
 * change-tracking microflow, e.g.:
 *
 *   [#false#Green####]
 *   [#false#Blue####]
 *   [#false#Red####]
 *
 * Which is generated in Mendix by concatenating:
 *
 *   '[' +
 *   Title + '#' +
 *   toString(BooleanAttr) + '#' +
 *   toString(EnumColorAttr) + '#' +
 *   StringAsOptionAttr + '#' +
 *   OnChangeEntity_OnChangeSingleRelation/TitleSingle + '#' +
 *   Variable + '#' +
 *   OnChangeSingleRelation/TitleSingle +
 *   ']'
 *
 * Note: `Variable` here is
 * `$OnChangeEntity/MyFirstModule.OnChangeEntity_OnChangeMultiRelation/MyFirstModule.OnChangeMultiRelation`,
 * i.e. a multi-relation (list of objects). When Mendix renders a list
 * association reference as part of a string concatenation, it produces a
 * "!"-prefixed, "!"-separated list of the associated objects' name
 * attributes, e.g.:
 *
 *   [#false####!Multi Option nr.1#]
 *   [#false####!Multi Option nr.1!Multi Option nr.2#]
 *   [#false####!Multi Option nr.1!Multi Option nr.2!Multi Option nr.3#]
 *
 * This field is therefore parsed into an array of strings (e.g.
 * `["Multi Option nr.1", "Multi Option nr.2"]`) rather than a single
 * scalar value.
 */

/** Ordered field names matching the microflow concatenation above. */
const LOG_ENTRY_FIELDS = [
    "title",
    "booleanAttr",
    "enumColorAttr",
    "stringAsOptionAttr",
    "singleAssocTitle",
    "multiAssocTitles",
    "passedAssociationTitle"
];

/** Field names whose raw value is a comma-separated list (multi-relation). */
const LIST_FIELDS = new Set(["multiAssocTitles"]);

/**
 * Converts a raw field string into a more meaningful JS value.
 * Empty strings become `null`, and "true"/"false" become booleans.
 * @param {string} value
 * @returns {string | boolean | null}
 */
function coerceValue(value) {
    if (value === "") {
        return null;
    }
    if (value === "true" || value === "false") {
        return value === "true";
    }
    return value;
}

/**
 * Converts a raw "!"-prefixed, "!"-separated field string into an array of
 * trimmed, non-empty strings. An empty input yields an empty array.
 *
 * e.g. "!Multi Option nr.1!Multi Option nr.2" -> ["Multi Option nr.1", "Multi Option nr.2"]
 * @param {string} value
 * @returns {string[]}
 */
function coerceListValue(value) {
    if (value === "") {
        return [];
    }
    return value
        .split("!")
        .map(item => item.trim())
        .filter(Boolean);
}

/**
 * Parses a single log entry line, e.g. "[#false#Green####]", into a
 * structured object.
 * @param {string} line
 * @returns {Record<string, string | boolean | string[] | null>}
 */
export function parseLogEntry(line) {
    const trimmed = line.trim();
    const match = trimmed.match(/^\[(.*)]$/);
    if (!match) {
        throw new Error(`Invalid log entry format: "${line}"`);
    }

    const fields = match[1].split("#");

    return LOG_ENTRY_FIELDS.reduce((entry, fieldName, index) => {
        const rawValue = fields[index] ?? "";
        entry[fieldName] = LIST_FIELDS.has(fieldName) ? coerceListValue(rawValue) : coerceValue(rawValue);
        return entry;
    }, {});
}

/**
 * Parses multi-line log output into an array of structured entries.
 * Blank lines are ignored.
 * @param {string} text
 * @returns {Array<Record<string, string | boolean | string[] | null>>}
 */
export function parseLogEntries(text) {
    return text
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean)
        .map(parseLogEntry);
}
