import { createElement, ReactElement, useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
    CKEditorHookProps,
    CKEditorType,
    CKEditorConfig,
    CKEditorEventAction,
    CKEditorInstance
} from "ckeditor4-react";
import { getDimensions, Dimensions } from "@mendix/pluggable-widgets-commons";
import { defineEnterMode, addPlugin, PluginName } from "../utils/ckeditorConfigs";
import sanitizeHtml from "sanitize-html";
import classNames from "classnames";
import { ReadOnlyStyleEnum, EnterModeEnum, ShiftEnterModeEnum } from "../../typings/RichTextProps";
import { MainEditor } from "./MainEditor";

export interface RichTextProps {
    name: string;
    readOnly: boolean;
    spellChecker: boolean;
    sanitizeContent?: boolean;
    value: string | undefined;
    plugins?: string[];
    readOnlyStyle: ReadOnlyStyleEnum;
    toolbar: CKEditorConfig;
    enterMode?: EnterModeEnum;
    shiftEnterMode?: ShiftEnterModeEnum;
    editorType: CKEditorType;
    dimensions?: Dimensions;
    advancedContentFilter?: { allowedContent: string; disallowedContent: string } | null;
    onValueChange?: (value: string) => void;
    onKeyChange?: () => void;
    onKeyPress?: () => void;
    tabIndex: number | undefined;
}

export const RichTextEditor = ({
    name,
    readOnly,
    spellChecker,
    sanitizeContent,
    value,
    plugins,
    readOnlyStyle,
    toolbar,
    enterMode,
    shiftEnterMode,
    editorType,
    dimensions,
    advancedContentFilter,
    onValueChange,
    onKeyChange,
    onKeyPress,
    tabIndex
}: RichTextProps): ReactElement => {
    const [element, setElement] = useState<HTMLElement | null>(null);
    const localEditorValueRef = useRef("");
    const editorInstanceRef = useRef<null | CKEditorInstance>(null);
    const editorRefCallback = useCallback(
        (editor: null | CKEditorInstance) => (editorInstanceRef.current = editor),
        []
    );
    const { width, height } = dimensions
        ? getDimensions({ ...dimensions })
        : {
              width: "100%",
              height: "100%"
          };

    const dispatchEvent = ({ type, payload }: { type: string; payload: any }): void => {
        if (type === CKEditorEventAction.key) {
            if (onKeyPress) {
                onKeyPress();
            }
        }
        if (type === CKEditorEventAction.change) {
            const value = payload.editor.getData();
            if (onKeyChange) {
                onKeyChange();
            }
            if (onValueChange) {
                const content = sanitizeContent ? sanitizeHtml(value) : value;
                localEditorValueRef.current = content;
                onValueChange(content);
            }
        }
    };

    const [ckeditorConfig, setCkeditorConfig] = useState<CKEditorHookProps<"change" | "key">>({
        element,
        editorUrl: `${window.mx.remoteUrl}widgets/ckeditor/ckeditor.js`,
        type: editorType,
        config: {
            autoGrow_minHeight: 300,
            toolbarCanCollapse: true,
            autoGrow_onStartup: true,
            width,
            height,
            tabIndex,
            enterMode: defineEnterMode(enterMode || ""),
            shiftEnterMode: defineEnterMode(shiftEnterMode || ""),
            disableNativeSpellChecker: !spellChecker,
            readOnly
        },
        initContent: value,
        dispatchEvent,
        subscribeTo: ["change", "key"]
    });

    const key = useMemo(() => Date.now(), [ckeditorConfig]);
    useEffect(() => {
        const config = { ...toolbar };
        if (plugins?.length) {
            plugins.forEach((plugin: PluginName) => addPlugin(plugin, config));
        }
        if (advancedContentFilter) {
            config.allowedContent = advancedContentFilter.allowedContent;
            config.disallowedContent = advancedContentFilter.disallowedContent;
        }

        setCkeditorConfig({
            ...ckeditorConfig,
            initContent: value,
            element,
            dispatchEvent,
            config: {
                ...ckeditorConfig.config,
                ...config,
                readOnly
            }
        });
    }, [element, readOnly]);

    useEffect(() => {
        const editor = editorInstanceRef.current;
        if (editor) {
            if (localEditorValueRef.current !== value) {
                editor.setData(value);
                localEditorValueRef.current = value ?? "";
            }
        }
    }, [value]);

    return (
        <div
            className={classNames("widget-rich-text", `${readOnly ? `editor-${readOnlyStyle}` : ""}`)}
            style={{ width, height }}
        >
            <div ref={setElement} id={name} />
            <MainEditor key={key} config={ckeditorConfig} editorRef={editorRefCallback} />
        </div>
    );
};
