/**
 * The Views loaded at runtime from the app's `node_modules/@combobox-ui/*`. Each package exports a
 * `Combobox` component over the ViewModel; the packages are external to the widget bundle (see
 * rollup.config.mjs) and have no copy in this repository.
 */
declare module "@combobox-ui/atlas" {
    import { ComponentType } from "react";
    import { ComboboxViewModel } from "src/core/ComboboxViewModel";

    export const Combobox: ComponentType<{ vm: ComboboxViewModel }>;
}

declare module "@combobox-ui/tailwind" {
    import { ComponentType } from "react";
    import { ComboboxViewModel } from "src/core/ComboboxViewModel";

    export const Combobox: ComponentType<{ vm: ComboboxViewModel }>;
}

declare module "@combobox-ui/mui" {
    import { ComponentType } from "react";
    import { ComboboxViewModel } from "src/core/ComboboxViewModel";

    export const Combobox: ComponentType<{ vm: ComboboxViewModel }>;
}

declare module "@combobox-ui/antd" {
    import { ComponentType } from "react";
    import { ComboboxViewModel } from "src/core/ComboboxViewModel";

    export const Combobox: ComponentType<{ vm: ComboboxViewModel }>;
}

declare module "@combobox-ui/ix" {
    import { ComponentType } from "react";
    import { ComboboxViewModel } from "src/core/ComboboxViewModel";

    export const Combobox: ComponentType<{ vm: ComboboxViewModel }>;
}
