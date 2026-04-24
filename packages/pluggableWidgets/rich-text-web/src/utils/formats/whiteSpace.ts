import { ClassAttributor, Scope } from "parchment";

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

export class WhiteSpaceClassAttributor extends ClassAttributor {}
export const WhiteSpaceClass = new WhiteSpaceClassAttributor("whitespace", "ql-whitespace", config);
