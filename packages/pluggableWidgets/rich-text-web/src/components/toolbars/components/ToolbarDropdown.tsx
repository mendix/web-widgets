import { ReactElement, useState, useRef, useEffect } from "react";
import { useCurrentEditor } from "../../EditorContext";
import { BaseToolbarButtonProps } from "../helpers/toolbarTypes";
import { ToolbarDropdownOption } from "../ToolbarConfig";
import { useDropdown } from "../hooks/useDropdown";

export function ToolbarDropdown({ config }: BaseToolbarButtonProps): ReactElement {
    const { editor } = useCurrentEditor();
    const { dropdownOptions: options, title: label } = config;
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [, setUpdateTrigger] = useState(0);

    const { refs, floatingStyles } = useDropdown({
        isOpen,
        onClose: () => setIsOpen(false),
        referenceElement: buttonRef.current
    });

    // Force re-render when editor selection or content changes
    useEffect(() => {
        if (!editor) return;

        const handleUpdate = (): void => {
            setUpdateTrigger(prev => prev + 1);
        };

        editor.on("selectionUpdate", handleUpdate);
        editor.on("transaction", handleUpdate);

        return () => {
            editor.off("selectionUpdate", handleUpdate);
            editor.off("transaction", handleUpdate);
        };
    }, [editor]);

    const currentValue = config.getCurrentValue && editor ? config.getCurrentValue(editor) : undefined;

    const handleSelect = (option: ToolbarDropdownOption): void => {
        if (!editor) return;

        if (option.attrs) {
            // Special handling for setFontFamily with fontValue
            if (option.command === "setFontFamily" && option.attrs.fontValue) {
                // New format: pass object with both fontFamily and fontValue
                (editor.chain().focus() as any)[option.command](option.attrs).run();
            } else {
                // Check if attrs has a single value to spread (e.g., setTextDirection("ltr"))
                const attrValues = Object.values(option.attrs);
                if (attrValues.length === 1 && typeof attrValues[0] === "string") {
                    // Single string parameter commands (e.g., setTextDirection)
                    (editor.chain().focus() as any)[option.command](attrValues[0]).run();
                } else {
                    // Object parameter commands (e.g., toggleHeading({ level: 1 }))
                    (editor.chain().focus() as any)[option.command](option.attrs).run();
                }
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
        <>
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className={`toolbar-dropdown-button ${config.name}`}
                title={config.title}
            >
                <span className="dropdown-label">{getCurrentLabel()}</span>
                <span className="icons icon-Arrow-down dropdown-arrow" />
            </button>
            {isOpen && (
                <div ref={refs.setFloating} style={floatingStyles} className="toolbar-dropdown-menu">
                    {options?.map(option => (
                        <button
                            key={option.value}
                            onClick={() => handleSelect(option)}
                            data-value={option.value}
                            className={`toolbar-dropdown-item ${currentValue === option.value ? "is-active" : ""}`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </>
    );
}
