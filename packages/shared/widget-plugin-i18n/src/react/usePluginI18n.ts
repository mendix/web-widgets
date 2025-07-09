import { useState } from "react";
import { I18nController } from "../controllers/I18nController";
import { PluginI18n } from "../types";

export function usePluginI18n(languageCode: string): PluginI18n | null {
    const [plugin, setPlugin] = useState<PluginI18n | null>(() => {
        new I18nController({
            languageCode,
            onPluginChange: plugin => setPlugin(plugin)
        });

        return null;
    });

    return plugin;
}
