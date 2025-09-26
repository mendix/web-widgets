import { Scope, StyleAttributor } from "parchment";

const config = {
    scope: Scope.INLINE,
    whitelist: [
        "normal",
        "pre",
        "pre-wrap",
        "pre-line",
        "nowrap",
        "wrap",
        "break-spaces",
        "collapse",
        "inherit",
        "initial",
        "revert",
        "unset"
    ]
};

export class WhiteSpaceStyleAttributor extends StyleAttributor {}
export const WhiteSpaceStyle = new WhiteSpaceStyleAttributor("whitespace", "white-space", config);
