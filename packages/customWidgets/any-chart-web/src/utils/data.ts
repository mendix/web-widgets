import { createElement } from "react";
import * as deepMerge from "deepmerge";
import { Store } from "redux";

export const validateAdvancedOptions = (rawData: string): string => {
    if (rawData && rawData.trim()) {
        try {
            JSON.parse(rawData.trim());
        } catch (error) {
            return (error as any).message;
        }
    }

    return "";
};

export const isContextChanged = (currentContext?: mendix.lib.MxObject, newContext?: mendix.lib.MxObject): boolean => {
    return (
        (!currentContext && !!newContext) ||
        (!!currentContext && !newContext) ||
        (!!currentContext && currentContext.getGuid()) !== (!!newContext && newContext.getGuid())
    );
};

const emptyTarget = (value: any) => (Array.isArray(value) ? [] : {});

const clone = (value: any, options: any) => deepMerge(emptyTarget(value), value, options);

export const arrayMerge = (target: any[], source: any[], options: any) => {
    const destination = target.slice();

    source.forEach((e, i) => {
        if (typeof destination[i] === "undefined") {
            const cloneRequested = options.clone !== false;
            const shouldClone = cloneRequested && options.isMergeableObject(e);
            destination[i] = shouldClone ? clone(e, options) : e;
        } else if (options.isMergeableObject(e)) {
            destination[i] = deepMerge(target[i], e, options);
        } else if (target.indexOf(e) === -1) {
            destination.push(e);
        }
    });

    return destination;
};

export const renderError = (id: string, errorMessages: string[]) => {
    if (errorMessages.length) {
        return createElement(
            "div",
            {},
            `Configuration error in widget ${id}:`,
            ...errorMessages.map((message, key) => createElement("p", { key }, message))
        );
    }

    return "";
};

type ReduxStoreKey = "scatter" | "bar" | "pie" | "heatmap" | "any";

export const generateInstanceID = (friendlyId: string) => `${friendlyId}-${Math.round(Math.random() * 2000)}`; // Needed to uniquely identify charts in listview.

export const getInstanceID = (friendlyId: string, store: Store, reduxStoreKey: ReduxStoreKey): string => {
    let instanceID = generateInstanceID(friendlyId);
    const instances: string[] = Object.keys(store.getState()[reduxStoreKey]);
    while (instances.indexOf(instanceID) > -1) {
        instanceID = generateInstanceID(friendlyId);
    }

    return instanceID;
};
