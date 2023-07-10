import { GoogleTagContainerProps, ParametersType } from "../typings/GoogleTagProps";
import commonGtag from "./commonGtag";
import { useEffect } from "react";

export function areParametersReady(parameters: GoogleTagContainerProps["parameters"]): boolean {
    return parameters.every(p => p.valueType === "predefined" || p.customValue?.status === "available");
}

export function prepareParameters(parameters: GoogleTagContainerProps["parameters"]): Record<string, string | boolean> {
    return Object.fromEntries(parameters.map(p => [p.name, prepareValue(p)]));
}

function prepareValue(p: ParametersType): string | boolean {
    if (p.valueType === "predefined") {
        return getPredefinedValue(p.predefinedValue);
    }

    if (!p.customValue || !p.customValue?.value) {
        throw new Error("no custom value");
    }

    const value = p.customValue.value;

    return value === "false" ? false : value === "true" ? true : replaceFullPathToken(value);
}

function getPathAndModule(): string {
    const formPath = window.mx.ui.getContentForm().path;

    return formPath.substring(0, formPath.length - 9);
}

function replaceFullPathToken(value: string): string {
    return value.replace("{{__ModuleAndPageName__}}", getPathAndModule());
}

export function getPredefinedValue(
    valueType: GoogleTagContainerProps["parameters"][number]["predefinedValue"]
): string {
    switch (valueType) {
        case "pageTitle":
            return window.mx.ui.getContentForm().title;
        case "pageUrl":
            return window.mx.ui.getContentForm().url ?? window.location.origin;
        case "pageName":
            return getPathAndModule().split("/")?.[1];
        case "moduleName":
            return getPathAndModule().split("/")?.[0];
        case "pageAndModuleName":
            return getPathAndModule();
        case "sessionId":
            return window.mx.session.getSessionObjectId();
        case "userLocale":
            return window.mx.session.getConfig().locale.code;
    }
}

export function executeCommand(
    command: string,
    eventName: string,
    params: Record<string, string | boolean>,
    tagId: string
): void {
    switch (command) {
        case "config": {
            commonGtag!.ensureGtagIncluded(tagId);
            commonGtag!.getGtag()(command, tagId, params);
            break;
        }
        case "event": {
            commonGtag!.getGtag()(command, eventName, params);
            break;
        }
    }
}

let checkedDojo = false;
export function useDojoOnNavigation(cb: () => void): void {
    if (!checkedDojo) {
        if (!window.dojo) {
            console.error("GoogleTagWidget: `window.dojo` is not found. Tracking page changes is disabled.");
        }
        checkedDojo = true;
    }

    if (window.dojo) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            const handle = window.dojo.connect(window.mx.ui.getContentForm(), "onNavigation", cb);

            return () => {
                window.dojo.disconnect(handle);
            };
        }, [cb]);
    }
}
