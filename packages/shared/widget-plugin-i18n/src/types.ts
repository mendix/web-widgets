import { i18n } from "i18next";

export interface PluginI18n {
    t: i18n["t"];
    changeLanguage: (languageCode: string) => void;
}
