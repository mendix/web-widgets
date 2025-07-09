import { useContext } from "react";
import { PluginI18n } from "../types";
import { getGlobalI18nPluginContext } from "./context";

export function useTranslation(): PluginI18n | null {
    return useContext(getGlobalI18nPluginContext());
}
