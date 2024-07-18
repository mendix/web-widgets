export * from "./provider.js";
export { error, value } from "./result-meta.js";
export { readInitFilterValues, unwrapAndExpression } from "./read-init-props.js";
export { useDefaultValue } from "./useDefaultValue";
export { useBasicSync } from "./helpers/useBasicSync.js";
export { useDateSync } from "./helpers/useDateSync.js";
export * from "./stores/main.js";
export type { Result, Success, Error } from "./result-meta.js";
export type { InitialFilterValue, BinaryExpression } from "./read-init-props.js";
export type { Option, OptionListFilterInterface } from "./typings/OptionListFilterInterface.js";
export type { InputFilterInterface } from "./typings/InputFilterInterface.js";
export { StaticFilterController } from "./controllers/StaticFilterController.js";

import * as mobx from "mobx";
(document as any).mobx ??= mobx;
