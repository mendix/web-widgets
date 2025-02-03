import { If } from "@mendix/widget-plugin-component-kit/If";
import { PropsWithChildren, ReactElement, createContext, createElement, useContext } from "react";
import { PresetEnum } from "typings/RichTextProps";
import type { ToolbarButtonProps, ToolbarConsumerContext, ToolbarContextType } from "./customToolbars";

export function presetToNumberConverter(preset: PresetEnum): number {
    switch (preset) {
        case "basic":
            return 1;
        case "standard":
            return 2;
        case "full":
            return 3;
        case "custom":
            return 4;
        default:
            return 1;
    }
}

export const ToolbarContext = createContext<ToolbarContextType>({
    presetValue: 0
});

export function FormatsContainer({ presetValue, children }: ToolbarConsumerContext & PropsWithChildren): ReactElement {
    const toolbarContextValue = useContext(ToolbarContext);
    return (
        <If condition={presetValue === undefined || toolbarContextValue.presetValue >= presetValue}>
            <span className="ql-formats" tabIndex={-1}>
                {children}
            </span>
        </If>
    );
}

export function ToolbarButton({
    presetValue,
    children,
    className,
    value,
    onClick,
    title
}: ToolbarButtonProps): ReactElement {
    const toolbarContextValue = useContext(ToolbarContext);
    return (
        <If condition={presetValue === undefined || toolbarContextValue.presetValue >= presetValue}>
            <button
                className={className}
                onClick={onClick}
                value={value}
                title={title}
                aria-label={title}
                tabIndex={-1}
            >
                {children}
            </button>
        </If>
    );
}

export function ToolbarDropdown({ presetValue, className, value, title }: ToolbarButtonProps): ReactElement {
    const toolbarContextValue = useContext(ToolbarContext);
    return (
        <If condition={presetValue === undefined || toolbarContextValue.presetValue >= presetValue}>
            <select className={className} title={title} aria-label={title} tabIndex={-1}>
                {Array.isArray(value) ? (
                    value.map(v => (
                        <option value={v.value || v} key={v.value || v}>
                            {v.description}
                        </option>
                    ))
                ) : (
                    <option value={value} key={value}></option>
                )}
            </select>
        </If>
    );
}
