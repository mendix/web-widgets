import { createContext } from "react";
import { PluginI18n } from "../types";

const contextPath = "com.mendix.widget.plugin.i18n.context" as const;

type I18nContext = React.Context<PluginI18n | null>;

const createI18nContext = (): I18nContext => createContext<PluginI18n | null>(null);

declare global {
    interface Window {
        [contextPath]?: ReturnType<typeof createI18nContext>;
    }
}

export function getGlobalI18nPluginContext(): I18nContext {
    return window[contextPath] ?? createI18nContext();
}
