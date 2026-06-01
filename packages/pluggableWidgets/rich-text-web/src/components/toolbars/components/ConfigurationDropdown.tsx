import Compact from "@uiw/react-color-compact";
import { ReactElement, useState, useRef } from "react";
import "./ConfigurationDropdown.scss";
import { useCurrentEditor } from "../../EditorContext";
import { BaseToolbarButtonProps } from "../helpers/toolbarTypes";
import { useDropdown } from "../hooks/useDropdown";

export interface ConfigurationSection {
    id: string;
    label: string;
    type: "colorPicker" | "dropdown";
    getCurrentValue?: () => string | null;
    onChange: (value: string) => void;
    options?: Array<{ value: string; label: string }>;
    defaultColor?: string;
}

export interface ConfigurationDropdownConfig {
    sections: ConfigurationSection[];
}

export function ConfigurationDropdown({ config }: BaseToolbarButtonProps): ReactElement {
    const { editor } = useCurrentEditor();
    const [isOpen, setIsOpen] = useState(false);
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
                                        color={currentValue || section.defaultColor || "#000000"}
                                        onChange={(color: { hex: string }) => {
                                            section.onChange(color.hex);
                                        }}
                                    />
                                )}
                                {section.type === "dropdown" && section.options && (
                                    <select
                                        className="configuration-select"
                                        value={currentValue || ""}
                                        onChange={e => section.onChange(e.target.value)}
                                    >
                                        {section.options.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
