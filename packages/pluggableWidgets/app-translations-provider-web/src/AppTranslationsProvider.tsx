import { getGlobalI18nPluginContext } from "@mendix/widget-plugin-i18n/react/context";
import { usePluginI18n } from "@mendix/widget-plugin-i18n/react/usePluginI18n";
import { ValueStatus } from "mendix";
import { Fragment, PropsWithChildren, ReactElement, createElement } from "react";
import { AppTranslationsProviderContainerProps } from "../typings/AppTranslationsProviderProps";

const { Provider } = getGlobalI18nPluginContext();

function I18nPluginProvider(props: PropsWithChildren<{ languageCode: string }>): ReactElement {
    const value = usePluginI18n(props.languageCode);

    return <Provider value={value}>{props.children}</Provider>;
}

export function AppTranslationsProvider({
    data,
    langAttr,
    children
}: AppTranslationsProviderContainerProps): ReactElement {
    if (data.status !== ValueStatus.Available) {
        return <Fragment />;
    }

    const items = data.items ?? [];
    if (!items.length) {
        console.error("App translations provider: language object is unavailable");
        return <Fragment />;
    }

    const langSource = langAttr.get(items[0]);
    if (langSource.status !== ValueStatus.Available) {
        return <Fragment />;
    }

    let lang = langSource.value;
    if (!lang) {
        console.error("App translations provider: language code is empty. Fallback to 'en'.");
        lang = "en";
    }

    return <I18nPluginProvider languageCode={lang}>{children}</I18nPluginProvider>;
}
