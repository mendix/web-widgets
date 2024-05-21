import * as locales from "date-fns/locale";
import { DatagridDateFilterContainerProps } from "../../typings/DatagridDateFilterProps";
import { registerLocale } from "react-datepicker";

export function isLoadingDefaultValues(props: DatagridDateFilterContainerProps): boolean {
    const statusList = [props.defaultValue?.status, props.defaultStartDate?.status, props.defaultEndDate?.status];
    return statusList.some(status => status === "loading");
}

interface DateFilterLocale {
    [key: string]: locales.Locale;
}

/**
 * Reg current locale in datepicker config.
 * Later this locale can be passed to datepicker as locale prop.
 */
export function setupLocales(): string {
    const { languageTag = "en-US" } = window.mx.session.getConfig().locale;

    const [language] = languageTag.split("-");
    const languageTagWithoutDash = languageTag.replace("-", "");

    if (languageTagWithoutDash in locales) {
        registerLocale(language, (locales as DateFilterLocale)[languageTagWithoutDash]);
    } else if (language in locales) {
        registerLocale(language, (locales as DateFilterLocale)[language]);
    }

    return language;
}
