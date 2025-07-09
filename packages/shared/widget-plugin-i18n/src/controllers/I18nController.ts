import { createInstance } from "i18next";
import HttpBackend from "i18next-http-backend";
import { PluginI18n } from "../types";

interface I18nProviderSpec {
    languageCode: string;
    onError?: (error: Error) => void;
    onContextChange: (context: PluginI18n) => void;
}

export class I18nController {
    private readonly _i18n: ReturnType<typeof createInstance>;
    private readonly _onContextChange: (context: PluginI18n) => void;
    private readonly _onError: (error: Error) => void;

    constructor(spec: I18nProviderSpec) {
        const backend = new HttpBackend(null, {
            loadPath: "/resources/i18n/{{lng}}/{{ns}}.json"
        });

        this._i18n = createInstance().use(backend);

        this._onContextChange = spec.onContextChange;

        this._onError = (err: any): void => {
            if (spec.onError) {
                spec.onError(err);
            } else {
                throw new Error(`I18n initialization error: ${err}`);
            }
        };

        const lng = this.convertLanguageCode(spec.languageCode);

        this._i18n
            .init({ lng })
            .then(t => this._onContextChange({ t }))
            .catch(this._onError);
    }

    changeLanguage(languageCode: string): void {
        const convertedLanguageCode = this.convertLanguageCode(languageCode);
        this._i18n
            .changeLanguage(convertedLanguageCode)
            .then(t => this._onContextChange({ t }))
            .catch(this._onError);
    }

    /**
     * Converts language code from underscore format (en_US) to dash format (en-US)
     * @param languageCode - Language code in format like "en_US"
     * @returns Language code in format like "en-US"
     */
    convertLanguageCode(languageCode: string): string {
        return languageCode.replace(/_/g, "-");
    }
}
