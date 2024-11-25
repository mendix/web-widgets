import { FloatingFocusManager } from "@floating-ui/react";
import classNames from "classnames";
import { createElement, CSSProperties, ReactElement, useState } from "react";
import { PositionEnum, TriggerEnum } from "../../typings/LanguageSelectorProps";
import { useFloatingUI } from "../hooks/useFloatingUI";
import { LanguageItem } from "../LanguageSelector";

export interface LanguageSwitcherProps {
    className: string;
    currentLanguage: LanguageItem | undefined;
    languageList: LanguageItem[];
    onSelect?: (lang: LanguageItem) => void;
    position: PositionEnum;
    screenReaderLabelCaption?: string;
    style?: CSSProperties;
    tabIndex: number;
    trigger: TriggerEnum;
}

export const LanguageSwitcher = ({
    className,
    currentLanguage,
    languageList,
    onSelect,
    position,
    screenReaderLabelCaption,
    style,
    tabIndex,
    trigger
}: LanguageSwitcherProps): ReactElement => {
    const [isOpen, setOpen] = useState(false);

    const {
        activeIndex,
        context,
        floatingStyles,
        getFloatingProps,
        getItemProps,
        getReferenceProps,
        handleSelect,
        isTypingRef,
        listRef,
        refs
    } = useFloatingUI({
        currentLanguage,
        isOpen,
        languageList,
        onSelect,
        position,
        setOpen,
        triggerOn: trigger
    });

    return (
        <div className={classNames(className, "widget-language-selector", "popupmenu")} style={style}>
            <div
                ref={refs?.setReference}
                className={"popupmenu-trigger popupmenu-trigger-alignment"}
                aria-label={screenReaderLabelCaption || "Language selector"}
                aria-autocomplete="none"
                aria-activedescendant={isOpen && activeIndex !== null ? "" : undefined}
                tabIndex={tabIndex}
                {...getReferenceProps?.()}
            >
                <span className="current-language-text">{currentLanguage?.value || ""}</span>
                <span className="language-arrow" aria-hidden="true">
                    <div className={`arrow-image ${isOpen ? "arrow-up" : "arrow-down"}`} />
                </span>
            </div>
            {isOpen && (
                <FloatingFocusManager context={context!} modal={false}>
                    <div
                        aria-activedescendant={isOpen && activeIndex !== null ? "" : undefined}
                        className="popupmenu-menu"
                        ref={refs?.setFloating}
                        style={{
                            ...floatingStyles,
                            outline: 0,
                            overflowY: "auto"
                        }}
                        {...getFloatingProps?.()}
                    >
                        {languageList.map((item, index) => (
                            <div
                                key={item._guid}
                                ref={node => {
                                    listRef.current[index] = node;
                                }}
                                role="option"
                                tabIndex={index === activeIndex ? 0 : -1}
                                className={classNames("popupmenu-basic-item", {
                                    active: currentLanguage === item,
                                    highlighted: activeIndex === index
                                })}
                                {...getItemProps?.({
                                    onKeyDown(event) {
                                        if (event.key === "Enter") {
                                            event.preventDefault();
                                            handleSelect(index);
                                        }

                                        if (event.key === " " && !isTypingRef.current) {
                                            event.preventDefault();
                                            handleSelect(index);
                                        }
                                    },
                                    onClick() {
                                        handleSelect(index);
                                    }
                                })}
                            >
                                {item.value}
                            </div>
                        ))}
                    </div>
                </FloatingFocusManager>
            )}
        </div>
    );
};
