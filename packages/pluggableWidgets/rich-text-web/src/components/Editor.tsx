import { debounce } from "@mendix/pluggable-widgets-commons";
import { CKEditorEventPayload, CKEditorHookProps, CKEditorInstance } from "ckeditor4-react";
import { Component, createElement } from "react";
import { RichTextContainerProps } from "../../typings/RichTextProps";
import { getCKEditorConfig } from "../utils/ckeditorConfigs";
import { MainEditor } from "./MainEditor";
import DOMPurify from "dompurify";

interface EditorProps {
    element: HTMLElement;
    widgetProps: RichTextContainerProps;
}

type EditorHookProps = CKEditorHookProps<never>;

export class Editor extends Component<EditorProps> {
    widgetProps: RichTextContainerProps;
    editor: CKEditorInstance | null;
    editorHookProps: EditorHookProps;
    editorKey: number;
    editorScript = "widgets/ckeditor/ckeditor.js";
    element: HTMLElement;
    lastSentValue: string | undefined;

    constructor(props: EditorProps) {
        super(props);
        // Props are read only, so, make a copy;
        this.widgetProps = { ...this.props.widgetProps };
        this.element = this.props.element;
        this.editorKey = this.getNewKey();
        this.editorHookProps = this.getNewEditorHookProps();
        this.onChange = debounce(this.onChange.bind(this), 500);
        this.onKeyPress = this.onKeyPress.bind(this);
    }

    setNewRenderProps(): void {
        this.widgetProps = { ...this.props.widgetProps };
        this.element = this.props.element;
        this.editorKey = this.getNewKey();
        this.editorHookProps = this.getNewEditorHookProps();
    }

    getRenderProps(): [number, EditorHookProps] {
        if (this.shouldRebuildEditor()) {
            this.setNewRenderProps();
        }

        return [this.editorKey, this.editorHookProps];
    }

    shouldRebuildEditor(): boolean {
        const keys = Object.keys(this.widgetProps) as Array<keyof RichTextContainerProps>;

        const prevProps = this.widgetProps;
        const nextProps = this.props.widgetProps;

        if (this.element !== this.props.element) {
            return true;
        }

        return keys.some(key => {
            // We skip stringAttribute as it always changes. And we
            // handle updates in componentDidUpdate method.
            if (key === "stringAttribute") {
                return false;
            }

            return prevProps[key] !== nextProps[key];
        });
    }

    getNewKey(): number {
        return Date.now();
    }

    getEditorUrl(): string {
        return new URL(this.editorScript, window.mx.remoteUrl).toString();
    }

    getNewEditorHookProps(): EditorHookProps {
        const onInstanceReady = this.onInstanceReady.bind(this);
        const onDestroy = this.onDestroy.bind(this);
        const config = getCKEditorConfig(this.widgetProps);

        return {
            element: this.element,
            editorUrl: this.getEditorUrl(),
            type: this.widgetProps.editorType,
            // Here we ignore hook API and instead use
            // editor instance to subscribe to events.
            subscribeTo: [],
            config: Object.assign(config, {
                on: {
                    instanceReady(this: CKEditorInstance) {
                        onInstanceReady(this);
                    },
                    destroy: onDestroy
                }
            })
        };
    }

    onInstanceReady(editor: CKEditorInstance): void {
        this.editor = editor;
        this.updateEditorState({
            data: this.widgetProps.stringAttribute.value
        });
    }

    onDestroy(): void {
        this.editor = null;
    }

    onKeyPress(): void {
        this.widgetProps.onKeyPress?.execute();
    }

    // onChange is wrapped in debounce, so, we always need to check
    // weather we sill have editor.
    onChange(_event: CKEditorEventPayload<"change">): void {
        if (this.editor) {
            const editorData = this.editor.getData();
            const content = this.widgetProps.sanitizeContent ? DOMPurify.sanitize(editorData) : editorData;
            this.lastSentValue = content;
            this.widgetProps.stringAttribute.setValue(content);
        }

        this.widgetProps.onChange?.execute();
    }

    addListeners(): void {
        if (this.editor && !this.editor.readOnly) {
            this.editor.on("change", this.onChange);
            this.editor.on("key", this.onKeyPress);
        }
    }

    removeListeners(): void {
        this.editor?.removeListener("change", this.onChange);
        this.editor?.removeListener("key", this.onKeyPress);
    }

    updateEditorState(
        args: { data: string | undefined; readOnly: boolean } | { data: string | undefined } | { readOnly: boolean }
    ): void {
        this.removeListeners();

        if ("readOnly" in args) {
            this.editor.setReadOnly(args.readOnly);
        }

        // The trick is that when setting new data,
        // we need to await till data become "ready" and
        // only then attach listeners. Otherwise onChange will
        // be called whenever we call setData, which is not what we want.
        // So, to solve this, we pass callback, which is called
        // when data is "read".
        // If we just update readOnly state, then we can
        // call addListeners immediately.
        // https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_editor.html#method-setData
        if ("data" in args) {
            this.editor?.setData(args.data, () => this.addListeners());
        } else {
            this.addListeners();
        }
    }

    updateEditor(
        prevAttr: RichTextContainerProps["stringAttribute"],
        nextAttr: RichTextContainerProps["stringAttribute"]
    ): void {
        if (this.editor) {
            const shouldUpdateData = nextAttr.value !== prevAttr.value && nextAttr.value !== this.lastSentValue;

            const shouldUpdateReadOnly = this.editor.readOnly !== nextAttr.readOnly;

            if (shouldUpdateData && shouldUpdateReadOnly) {
                this.updateEditorState({
                    data: nextAttr.value,
                    readOnly: nextAttr.readOnly
                });
            } else if (shouldUpdateData) {
                this.updateEditorState({
                    data: nextAttr.value
                });
            } else if (shouldUpdateReadOnly) {
                this.updateEditorState({
                    readOnly: nextAttr.readOnly
                });
            }
        }

        this.lastSentValue = undefined;
    }

    componentDidUpdate(): void {
        const prevAttr = this.widgetProps.stringAttribute;
        const nextAttr = this.props.widgetProps.stringAttribute;

        if (prevAttr !== nextAttr) {
            this.widgetProps.stringAttribute = nextAttr;
            this.updateEditor(prevAttr, nextAttr);
        }
    }

    render(): JSX.Element | null {
        const [key, config] = this.getRenderProps();

        return <MainEditor key={key} config={config} />;
    }
}
