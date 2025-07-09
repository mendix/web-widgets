import { createInstance, TFunction } from "i18next";
import HttpBackend from "i18next-http-backend";
import { PluginI18n } from "../types";

interface I18nControllerSpec {
    languageCode: string;
    onError?: (error: Error) => void;
    onPluginChange: (plugin: PluginI18n) => void;
}

export class I18nController {
    private readonly _i18n: ReturnType<typeof createInstance>;
    private readonly _onPluginChange: (context: PluginI18n) => void;
    private readonly _onError: (error: Error) => void;

    constructor(spec: I18nControllerSpec) {
        const backend = new HttpBackend(null, {
            loadPath: "/resources/i18n/{{lng}}/{{ns}}.json"
        });

        this._i18n = createInstance().use(backend);

        this._onPluginChange = spec.onPluginChange;

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
            .then(t => this._onPluginChange(this._createPlugin(t)))
            .catch(this._onError);
    }

    private _createPlugin(t: TFunction): PluginI18n {
        return {
            t,
            changeLanguage: (languageCode: string) => this.changeLanguage(languageCode)
        };
    }

    changeLanguage(languageCode: string): void {
        const convertedLanguageCode = this.convertLanguageCode(languageCode);
        this._i18n
            .changeLanguage(convertedLanguageCode)
            .then(t => this._onPluginChange(this._createPlugin(t)))
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
