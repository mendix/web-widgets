import { ReactElement, useState, useRef, useEffect, useId, KeyboardEvent } from "react";
import { MAX_ORDERED_LIST_START } from "../../../extensions/OrderedListStyled";
import { useT } from "../../../utils/i18n";
import { useCurrentEditor } from "../../EditorContext";
import { getIconForOrderedListStyle, normalizeStartInput, OrderedListStyle } from "../helpers/listHelpers";
import { useDropdown } from "../hooks/useDropdown";
import { ToolbarButtonConfig, ToolbarDropdownOption } from "../ToolbarConfig";
import { ToolbarDefaultButton } from "./ToolbarDefaultButton";

// Module-level sticky state for last-used ordered list style
let lastOrderedListStyle: OrderedListStyle = "decimal";

interface ToolbarSplitButtonProps {
    config: ToolbarButtonConfig;
}

type FocusedPart = "main" | "dropdown";

export function ToolbarSplitButton({ config }: ToolbarSplitButtonProps): ReactElement {
    const { editor } = useCurrentEditor();
    const t = useT();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [, setUpdateTrigger] = useState(0);
    const mainButtonRef = useRef<HTMLButtonElement>(null);
    const dropdownButtonRef = useRef<HTMLButtonElement>(null);
    const startInputId = useId();
    // Text typed in the start input that is not yet applied, or null when the input shows the
    // list's current start. Mirrored in a ref so the close path reads the latest value: a click
    // outside unmounts the input before its blur event fires.
    const [startDraft, setStartDraft] = useState<string | null>(null);
    const startDraftRef = useRef<string | null>(null);

    const updateStartDraft = (value: string | null): void => {
        startDraftRef.current = value;
        setStartDraft(value);
    };

    const getCurrentStart = (): number => {
        if (!editor?.isActive("orderedList")) {
            return 1;
        }
        const start = Number(editor.getAttributes("orderedList").start);
        return Number.isInteger(start) && start > 0 ? start : 1;
    };

    // Applies the pending start input value, if any. The draft is cleared first so a later blur
    // (for example when the input unmounts) does not apply it a second time.
    const commitStartDraft = (focusEditor: boolean): void => {
        const raw = startDraftRef.current;
        if (raw === null || !editor) {
            return;
        }
        updateStartDraft(null);

        const current = getCurrentStart();
        const next = normalizeStartInput(raw, current, MAX_ORDERED_LIST_START);
        if (next === current || !editor.isActive("orderedList")) {
            return;
        }

        const chain = editor.chain();
        (focusEditor ? chain.focus() : chain).setOrderedListStart(next).run();
    };

    const closeDropdown = (): void => {
        commitStartDraft(false);
        setIsDropdownOpen(false);
    };

    const { refs, floatingStyles } = useDropdown({
        isOpen: isDropdownOpen,
        onClose: closeDropdown,
        referenceElement: dropdownButtonRef.current
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

    if (!editor) {
        return <></>;
    }

    const isActive = config.isActive ? config.isActive(editor) : false;

    // Get current icon based on active state or sticky state
    const getCurrentIcon = (): string => {
        if (editor.isActive("orderedList")) {
            const attrs = editor.getAttributes("orderedList");
            const style = (attrs.listStyleType || "decimal") as OrderedListStyle;
            return getIconForOrderedListStyle(style);
        }
        return getIconForOrderedListStyle(lastOrderedListStyle);
    };

    const currentIcon = getCurrentIcon();
    const currentValue = config.getCurrentValue ? config.getCurrentValue(editor) : "";

    // Main button click handler
    const handleMainClick = (): void => {
        if (!editor) return;

        if (isActive) {
            // Toggle off
            editor.chain().focus().toggleOrderedList().run();
        } else {
            // Toggle on with sticky style
            const styleType = lastOrderedListStyle === "decimal" ? null : lastOrderedListStyle;
            editor
                .chain()
                .focus()
                .toggleOrderedList()
                .updateAttributes("orderedList", { listStyleType: styleType })
                .run();
        }
    };

    // Dropdown button click handler
    const handleDropdownClick = (): void => {
        if (isDropdownOpen) {
            closeDropdown();
        } else {
            setIsDropdownOpen(true);
        }
    };

    // Moves focus between the style options and the start input with the arrow keys.
    const moveMenuFocus = (current: HTMLElement, step: 1 | -1): void => {
        const items = Array.from(
            refs.floating.current?.querySelectorAll<HTMLElement>("button:not(:disabled), input:not(:disabled)") ?? []
        );
        const index = items.indexOf(current);
        items[index + step]?.focus();
    };

    const handleMenuItemKeyDown = (e: KeyboardEvent<HTMLButtonElement>): void => {
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                moveMenuFocus(e.currentTarget, 1);
                break;
            case "ArrowUp":
                e.preventDefault();
                moveMenuFocus(e.currentTarget, -1);
                break;
            case "Escape":
                e.preventDefault();
                closeDropdown();
                dropdownButtonRef.current?.focus();
                break;
        }
    };

    // ArrowUp and ArrowDown are left to the number input, which uses them to change the value.
    const handleStartInputKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === "Enter") {
            e.preventDefault();
            commitStartDraft(true);
            setIsDropdownOpen(false);
        } else if (e.key === "Escape") {
            e.preventDefault();
            updateStartDraft(null);
            setIsDropdownOpen(false);
            editor.commands.focus();
        }
    };

    // Dropdown option selection handler
    const handleOptionSelect = (option: ToolbarDropdownOption): void => {
        if (!editor) return;

        // Update sticky state
        const styleValue = option.value as OrderedListStyle;
        // eslint-disable-next-line react-hooks/globals
        lastOrderedListStyle = styleValue;

        const styleType = styleValue === "decimal" ? null : styleValue;

        if (isActive) {
            // Just change style
            editor.chain().focus().updateAttributes("orderedList", { listStyleType: styleType }).run();
        } else {
            // Enable OL + apply style
            editor
                .chain()
                .focus()
                .toggleOrderedList()
                .updateAttributes("orderedList", { listStyleType: styleType })
                .run();
        }

        setIsDropdownOpen(false);
    };

    // Keyboard navigation handler
    const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, part: FocusedPart): void => {
        switch (e.key) {
            case "ArrowRight":
                if (part === "main") {
                    e.preventDefault();
                    dropdownButtonRef.current?.focus();
                }
                break;
            case "ArrowLeft":
                if (part === "dropdown") {
                    e.preventDefault();
                    mainButtonRef.current?.focus();
                }
                break;
            case "ArrowDown":
                e.preventDefault();
                setIsDropdownOpen(true);
                break;
            case "Enter":
            case " ":
                e.preventDefault();
                if (part === "main") {
                    handleMainClick();
                } else {
                    handleDropdownClick();
                }
                break;
        }
    };

    return (
        <div className={`split-button ${isActive ? "is-active" : ""}`} role="group" aria-label={t(config.title)}>
            <ToolbarDefaultButton
                ref={mainButtonRef}
                onClick={handleMainClick}
                onKeyDown={e => handleKeyDown(e, "main")}
                className="split-button-main icon-button"
                title={t(config.title)}
                aria-label={`${t(config.title)} - Toggle`}
                aria-pressed={isActive}
            >
                <span className={`icons icon-${currentIcon}`} />
            </ToolbarDefaultButton>

            <ToolbarDefaultButton
                ref={dropdownButtonRef}
                onClick={handleDropdownClick}
                onKeyDown={e => handleKeyDown(e, "dropdown")}
                className="split-button-dropdown"
                title={`${t(config.title)} - Style options`}
                aria-label={`${t(config.title)} - Style options`}
                aria-expanded={isDropdownOpen}
                aria-haspopup="menu"
            >
                <span className="icons icon-Arrow-down dropdown-arrow" />
            </ToolbarDefaultButton>

            {isDropdownOpen && (
                <div ref={refs.setFloating} style={floatingStyles} className="toolbar-dropdown-menu" role="menu">
                    {config.dropdownOptions?.map(option => (
                        <ToolbarDefaultButton
                            key={option.value}
                            onClick={() => handleOptionSelect(option)}
                            onKeyDown={handleMenuItemKeyDown}
                            className="toolbar-dropdown-item"
                            isActive={currentValue === option.value}
                            role="menuitem"
                        >
                            {option.icon && <span className={`icons icon-${option.icon}`} />}
                            <span>{t(option.label)}</span>
                        </ToolbarDefaultButton>
                    ))}
                    <div className="toolbar-dropdown-start" role="group" aria-labelledby={`${startInputId}-label`}>
                        <label id={`${startInputId}-label`} htmlFor={startInputId}>
                            {t("toolbar.orderedListStart")}
                        </label>
                        <input
                            id={startInputId}
                            type="number"
                            className="toolbar-dropdown-start-input"
                            min={1}
                            max={MAX_ORDERED_LIST_START}
                            step={1}
                            disabled={!isActive || !editor.isEditable}
                            value={startDraft ?? String(getCurrentStart())}
                            onChange={e => updateStartDraft(e.target.value)}
                            onBlur={() => commitStartDraft(false)}
                            onKeyDown={handleStartInputKeyDown}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
