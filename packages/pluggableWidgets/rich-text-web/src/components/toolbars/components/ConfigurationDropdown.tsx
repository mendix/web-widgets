import Compact from "@uiw/react-color-compact";
import { ReactElement, useState, useRef, KeyboardEvent as ReactKeyboardEvent } from "react";
import "./ConfigurationDropdown.scss";
import "./ColorPicker.scss";
import { ToolbarDefaultButton } from "./ToolbarDefaultButton";
import { useT } from "../../../utils/i18n";
import { useCurrentEditor } from "../../EditorContext";
import { BaseToolbarButtonProps } from "../helpers/toolbarTypes";
import { useDropdown } from "../hooks/useDropdown";

export interface ConfigurationSection {
    id: string;
    label: string;
    type: "colorPicker" | "dropdown" | "numberInput" | "textInput";
    getCurrentValue?: () => string | number | null;
    onChange: (value: string) => void;
    onClear?: () => void;
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
    const t = useT();
    const [isOpen, setIsOpen] = useState(false);
    // Local draft buffer for text/number inputs. onChange writes here only; the
    // editor is committed to on blur/Enter so typing does not trigger a re-render
    // that would steal focus. Keyed by section id.
    const [draftValues, setDraftValues] = useState<Record<string, string>>({});
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Discard a section's draft (revert the input to the last committed value)
    const clearDraft = (sectionId: string): void => {
        setDraftValues(prev => {
            const next = { ...prev };
            delete next[sectionId];
            return next;
        });
    };

    // Commit a value to the editor, then drop the draft so the input reflects the
    // committed value (invalid values are ignored by the section, so the input reverts).
    const commitDraft = (section: ConfigurationSection, value: string): void => {
        section.onChange(value);
        clearDraft(section.id);
    };

    // Keydown for buffered inputs: Enter commits + blurs, Escape discards + blurs.
    const handleDraftKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>, section: ConfigurationSection): void => {
        if (e.key === "Enter") {
            e.preventDefault();
            commitDraft(section, e.currentTarget.value);
            e.currentTarget.blur();
        } else if (e.key === "Escape") {
            e.preventDefault();
            clearDraft(section.id);
            e.currentTarget.blur();
        }
    };

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
            <ToolbarDefaultButton
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                icon={config.icon}
                title={t(config.title)}
            />
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
                                        addonAfter={
                                            section.onClear ? (
                                                <button
                                                    type="button"
                                                    className="color-picker-clear"
                                                    title={t("colorPicker.clear")}
                                                    aria-label={t("colorPicker.clear")}
                                                    onClick={() => section.onClear?.()}
                                                >
                                                    ✕
                                                </button>
                                            ) : undefined
                                        }
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
                                {(section.type === "numberInput" || section.type === "textInput") && (
                                    <div className="configuration-number-input">
                                        <input
                                            type={section.type === "numberInput" ? "number" : "text"}
                                            className="configuration-input"
                                            min={section.type === "numberInput" ? section.min : undefined}
                                            max={section.type === "numberInput" ? section.max : undefined}
                                            step={section.type === "numberInput" ? section.step || 1 : undefined}
                                            placeholder={section.placeholder || ""}
                                            value={
                                                draftValues[section.id] !== undefined
                                                    ? draftValues[section.id]
                                                    : ((currentValue as string | number | null) ?? "")
                                            }
                                            onChange={e => {
                                                // Draft only — do NOT touch the editor while typing (avoids focus loss)
                                                const value = e.target.value;
                                                setDraftValues(prev => ({ ...prev, [section.id]: value }));
                                            }}
                                            onBlur={e => commitDraft(section, e.target.value)}
                                            onKeyDown={e => handleDraftKeyDown(e, section)}
                                        />
                                        {section.unit && <span className="configuration-unit">{section.unit}</span>}
                                        {currentValue !== null && currentValue !== "" && (
                                            <button
                                                type="button"
                                                className="configuration-clear-button"
                                                onClick={() => {
                                                    clearDraft(section.id);
                                                    section.onChange("");
                                                }}
                                                title={t("config.clearAuto")}
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
