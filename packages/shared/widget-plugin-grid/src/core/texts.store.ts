import { DynamicValue } from "mendix";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";

type DynamicValueKeys<TProps> = {
    [K in keyof TProps]: TProps[K] extends DynamicValue<string> | undefined ? K : never;
}[keyof TProps];

export type OverrideMap<TProps, TT> = {
    [K in keyof TT]?: DynamicValueKeys<TProps>;
};

type NoParamKeys<TT> = {
    [K in keyof TT]: TT[K] extends [] ? K : never;
}[keyof TT & string];

type WithParamKeys<TT> = {
    [K in keyof TT]: TT[K] extends [] ? never : K;
}[keyof TT & string];

export interface DerivedTextsStore<TT> {
    get(key: NoParamKeys<TT>): string;
    get(key: WithParamKeys<TT>, params: string[]): string;
}

function replaceParamPlaceholders(template: string, params: string[]): string {
    let result = template.replace(/%d/g, params[0] ?? "");
    params.forEach((p, i) => {
        result = result.split(`{${i + 1}}`).join(p);
    });
    return result;
}

export function createTextsStore<TProps extends { texts: { translate: (...args: any[]) => string } }, TT>(
    gate: DerivedPropsGate<TProps>,
    overrideMap?: OverrideMap<TProps, TT>
): DerivedTextsStore<TT> {
    function get(key: string, params?: string[]): string {
        const overridePropKey = overrideMap?.[key as keyof TT];
        const override = overridePropKey
            ? (gate.props[overridePropKey] as DynamicValue<string> | undefined)?.value
            : undefined;

        if (override) {
            return params ? replaceParamPlaceholders(override, params) : override;
        }

        return params ? gate.props.texts.translate(key, params) : gate.props.texts.translate(key);
    }
    return { get } as DerivedTextsStore<TT>;
}
