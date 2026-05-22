import { ReactElement, useState, useRef, useEffect } from "react";
import { useCurrentEditor } from "../../EditorContext";
import { ToolbarDropdownOption } from "../ToolbarConfig";
import { BaseToolbarButtonProps } from "../helpers/toolbarTypes";

export function ToolbarDropdown({ config }: BaseToolbarButtonProps): ReactElement {
    const { editor } = useCurrentEditor();
    const { dropdownOptions: options, title: label } = config;
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const currentValue = config.getCurrentValue && editor ? config.getCurrentValue(editor) : undefined;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent): void => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (option: ToolbarDropdownOption): void => {
        if (!editor) return;

        if (option.attrs) {
            // Check if attrs has a single value to spread (e.g., setTextDirection("ltr"))
            const attrValues = Object.values(option.attrs);
            if (attrValues.length === 1 && typeof attrValues[0] === "string") {
                // Single string parameter commands (e.g., setTextDirection, setFontFamily)
                (editor.chain().focus() as any)[option.command](attrValues[0]).run();
            } else {
                // Object parameter commands (e.g., toggleHeading({ level: 1 }))
                (editor.chain().focus() as any)[option.command](option.attrs).run();
            }
        } else {
            (editor.chain().focus() as any)[option.command]().run();
        }
        setIsOpen(false);
    };

    const getCurrentLabel = (): string => {
        const current = options?.find(opt => opt.value === currentValue);
        return current ? current.label : label || "Select...";
    };

    return (
        <div className="toolbar-dropdown" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="toolbar-dropdown-button" title="Text Format">
                <span className="dropdown-label">{getCurrentLabel()}</span>
                <span className="icons icon-Arrow-down dropdown-arrow" />
            </button>
            {isOpen && (
                <div className="toolbar-dropdown-menu">
                    {options?.map(option => (
                        <button
                            key={option.value}
                            onClick={() => handleSelect(option)}
                            className={`toolbar-dropdown-item ${currentValue === option.value ? "is-active" : ""}`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
