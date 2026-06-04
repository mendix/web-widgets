import Compact from "@uiw/react-color-compact";
import { ReactElement, useState, useRef } from "react";
import "./ConfigurationDropdown.scss";
import { useCurrentEditor } from "../../EditorContext";
import { BaseToolbarButtonProps } from "../helpers/toolbarTypes";
import { useDropdown } from "../hooks/useDropdown";

export interface ConfigurationSection {
    id: string;
    label: string;
    type: "colorPicker" | "dropdown" | "numberInput";
    getCurrentValue?: () => string | number | null;
    onChange: (value: string) => void;
    options?: Array<{ value: string; label: string }>;
    defaultColor?: string;
    min?: number;
    max?: number;
    step?: number;
    placeholder?: string;
    unit?: string;
}

export interface ConfigurationDropdownConfig {
    sections: ConfigurationSection[];
}

export function ConfigurationDropdown({ config }: BaseToolbarButtonProps): ReactElement {
    const { editor } = useCurrentEditor();
    const [isOpen, setIsOpen] = useState(false);
    const [numberInputValues, setNumberInputValues] = useState<Record<string, string>>({});
    const buttonRef = useRef<HTMLButtonElement>(null);

    const { refs, floatingStyles } = useDropdown({
        isOpen,
        onClose: () => setIsOpen(false),
        referenceElement: buttonRef.current
    });

    if (!editor || !config.configurationSections) {
        return <></>;
    }

    const sections = config.configurationSections;

    return (
        <div style={{ position: "relative" }}>
            <button ref={buttonRef} onClick={() => setIsOpen(!isOpen)} className="icon-button" title={config.title}>
                <span className={`icons icon-${config.icon}`} />
            </button>
            {isOpen && (
                <div ref={refs.setFloating} className="configuration-dropdown" style={floatingStyles}>
                    {sections.map(section => {
                        const currentValue = section.getCurrentValue ? section.getCurrentValue() : null;

                        return (
                            <div key={section.id} className="configuration-section">
                                <label className="configuration-label">{section.label}</label>
                                {section.type === "colorPicker" && (
                                    <Compact
                                        color={(currentValue as string) || section.defaultColor || "#000000"}
                                        onChange={(color: { hex: string }) => {
                                            section.onChange(color.hex);
                                        }}
                                    />
                                )}
                                {section.type === "dropdown" && section.options && (
                                    <select
                                        className="configuration-select"
                                        value={(currentValue as string) || ""}
                                        onChange={e => section.onChange(e.target.value)}
                                    >
                                        {section.options.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {section.type === "numberInput" && (
                                    <div className="configuration-number-input">
                                        <input
                                            type="number"
                                            className="configuration-input"
                                            min={section.min}
                                            max={section.max}
                                            step={section.step || 1}
                                            placeholder={section.placeholder || ""}
                                            value={
                                                numberInputValues[section.id] !== undefined
                                                    ? numberInputValues[section.id]
                                                    : (currentValue ?? "")
                                            }
                                            onChange={e => {
                                                const value = e.target.value;
                                                setNumberInputValues(prev => ({ ...prev, [section.id]: value }));
                                                section.onChange(value);
                                            }}
                                            onBlur={() => {
                                                setNumberInputValues(prev => {
                                                    const next = { ...prev };
                                                    delete next[section.id];
                                                    return next;
                                                });
                                            }}
                                        />
                                        {section.unit && <span className="configuration-unit">{section.unit}</span>}
                                        {currentValue !== null && currentValue !== "" && (
                                            <button
                                                type="button"
                                                className="configuration-clear-button"
                                                onClick={() => {
                                                    setNumberInputValues(prev => {
                                                        const next = { ...prev };
                                                        delete next[section.id];
                                                        return next;
                                                    });
                                                    section.onChange("");
                                                }}
                                                title="Clear (auto width)"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
