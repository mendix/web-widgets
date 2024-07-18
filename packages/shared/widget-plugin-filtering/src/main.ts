export { StaticFilterController } from "./controllers/StaticFilterController.js";
export { useBasicSync } from "./helpers/useBasicSync.js";
export { useDateSync } from "./helpers/useDateSync.js";
export * from "./provider.js";
export { readInitFilterValues, unwrapAndExpression } from "./read-init-props.js";
export { error, value } from "./result-meta.js";
export * from "./stores/main.js";
export { useDefaultValue } from "./useDefaultValue";

export type { BinaryExpression, InitialFilterValue } from "./read-init-props.js";
export type { Error, Result, Success } from "./result-meta.js";
export type {
    Date_InputFilterInterface,
    InputFilterInterface,
    Number_InputFilterInterface,
    String_InputFilterInterface
} from "./typings/InputFilterInterface.js";
export type { Option, OptionListFilterInterface } from "./typings/OptionListFilterInterface.js";

import * as mobx from "mobx";
(document as any).mobx ??= mobx;
