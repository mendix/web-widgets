import { EditableValue } from "mendix";
import { useMemo } from "react";
import { AttrStorage } from "./AttrStorage";
import { SettingsClient } from "./base";

export function useSettingsClient(hash: string, settingsAttr?: EditableValue<string>): SettingsClient {
    return useMemo(() => {
        if (settingsAttr?.status === "available") {
            return { status: "available", settings: new AttrStorage(settingsAttr, hash) };
        }
        if (settingsAttr?.status === "loading") {
            return { status: "loading", settings: undefined };
        }
        return { status: "unavailable", settings: undefined };
    }, [hash, settingsAttr]);
}
