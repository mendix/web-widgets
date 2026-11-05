import { ComponentType, lazy } from "react";
import { ComboboxViewModel } from "../core/ComboboxViewModel";

export type UiVariantView = ComponentType<{ vm: ComboboxViewModel }>;

/**
 * The Views loaded at runtime from the app's `node_modules/@combobox-ui/*`. The packages are
 * external to the widget bundle (see rollup.config.mjs); Studio Pro's bundler resolves the dynamic
 * imports when it bundles the app, so each View is a chunk fetched on the first render of a widget
 * instance that asks for it.
 */
export const uiVariants = {
    atlas: lazy(() => import("@combobox-ui/atlas").then(m => ({ default: m.Combobox }))),
    tailwind: lazy(() => import("@combobox-ui/tailwind").then(m => ({ default: m.Combobox }))),
    mui: lazy(() => import("@combobox-ui/mui").then(m => ({ default: m.Combobox }))),
    antd: lazy(() => import("@combobox-ui/antd").then(m => ({ default: m.Combobox }))),
    ix: lazy(() => import("@combobox-ui/ix").then(m => ({ default: m.Combobox })))
} satisfies Record<string, UiVariantView>;

export type UiVariant = keyof typeof uiVariants;

/**
 * Test switch, until a widget property exists: a widget whose Studio Pro name ends in `_<variant>`
 * (for example `comboBox1_atlas`) renders that variant; any other name renders the widget's own
 * Atlas View. The Class and Style properties cannot serve: with the Label system property the
 * client puts them on the form-group wrapper and never passes them to the widget.
 */
export function uiVariantFromName(widgetName: string): UiVariant | undefined {
    const name = /_([a-z]+)$/.exec(widgetName)?.[1];
    return name !== undefined && name in uiVariants ? (name as UiVariant) : undefined;
}
