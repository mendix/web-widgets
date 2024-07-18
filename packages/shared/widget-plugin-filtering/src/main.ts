export * from "./provider.js";
export { readInitFilterValues, unwrapAndExpression } from "./read-init-props.js";
export { error, value } from "./result-meta.js";
export { useDefaultValue } from "./useDefaultValue";

export type { BinaryExpression, InitialFilterValue } from "./read-init-props.js";
export type { Error, Result, Success } from "./result-meta.js";

import * as mobx from "mobx";
(document as any).mobx ??= mobx;
