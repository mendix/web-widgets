import { debounce } from "@mendix/widget-plugin-platform/utils/debounce";
import {
    CKEditorEventPayload,
    CKEditorHookProps,
    CKEditorInstance,
    CKEditorNamespace,
    CKEditorEventAction
} from "ckeditor4-react";
import { Component, createElement } from "react";
import { RichTextContainerProps } from "../../typings/RichTextProps";
import { getCKEditorConfig } from "../utils/ckeditorConfigs";
import { MainEditor } from "./MainEditor";
import DOMPurify from "dompurify";
import { ValueStatus } from "mendix";

const FILE_SIZE_LIMIT = 1048576; // Binary bytes for 1MB

interface EditorProps {
    element: HTMLElement;
    widgetProps: RichTextContainerProps;
}

type EditorHookProps = CKEditorHookProps<never>;

interface CKEditorEvent {
    data: any;
    listenerData: any;
    name: string;
    sender: { [key: string]: any };

    cancel(): void;
    removeListener(): void;
    stop(): void;
}

class ContentTemplate {
    title: string;
    description: string;
    html: string;

    constructor(title: string, description: string, html: string) {
        this.title = title;
        this.description = description;
        this.html = html;
    }
}

export class Editor extends Component<EditorProps> {
    widgetProps: RichTextContainerProps;
    editor: CKEditorInstance | null;
    editorHookProps: EditorHookProps;
    editorKey: number;
    editorScript = "widgets/ckeditor/ckeditor.js";
    element: HTMLElement;
    namespace: CKEditorNamespace;
    lastSentValue: string | undefined;
    applyChangesDebounce: () => void;
    setDataDebounce: (data: string | undefined) => void;
    cancelRAF: (() => void) | undefined;
    hasFocus: boolean;

    constructor(props: EditorProps) {
        super(props);
        // Props are read only, so, make a copy;
        this.widgetProps = { ...this.props.widgetProps };
        this.element = this.props.element;
        this.editorKey = this.getNewKey();
        this.editorHookProps = this.getNewEditorHookProps(/*true*/);
        this.onChange = this.onChange.bind(this);
        this.applyChangesDebounce = debounce(this.applyChangesImmediately.bind(this), 500)[0];
        this.setDataDebounce = debounce(data => this.editor?.setData(data, () => this.addListeners()), 50)[0];
        this.onKeyPress = this.onKeyPress.bind(this);
        this.onPasteContent = this.onPasteContent.bind(this);
        this.onDropContent = this.onDropContent.bind(this);
        this.hasFocus = false;
    }

    setNewRenderProps(): void {
        this.widgetProps = { ...this.props.widgetProps };
        this.element = this.props.element;
        this.editorKey = this.getNewKey();
        this.editorHookProps = this.getNewEditorHookProps();
    }

    getRenderProps(): [number, EditorHookProps] {
        this.setNewRenderProps();
        return [this.editorKey, this.editorHookProps];
    }

    shouldUpdateEditor(): boolean {
        if (this.element !== this.props.element) {
            return true;
        } else {
            const keys = Object.keys(this.widgetProps) as Array<keyof RichTextContainerProps>;

            const prevProps = this.widgetProps;
            const nextProps = this.props.widgetProps;

            return keys.some(key => {
                // We skip stringAttribute as it always changes. And we
                // handle updates in componentDidUpdate method.
                if (key === "stringAttribute") {
                    return false;
                }

                if (key === "onChange") {
                    return false;
                }

                if (key === "onKeyPress") {
                    return false;
                }

                return prevProps[key] !== nextProps[key];
            });
        }
    }

    getNewKey(): number {
        return Date.now();
    }

    getEditorUrl(): string {
        return new URL(this.editorScript, window.mx.remoteUrl).toString();
    }

    getNewEditorHookProps(): EditorHookProps {
        const onInstanceReady = this.onInstanceReady.bind(this);
        const onPluginsLoaded = this.onPluginsLoaded.bind(this);
        const onDestroy = this.onDestroy.bind(this);
        const config = getCKEditorConfig(this.widgetProps);

        return {
            element: this.props.element,
            editorUrl: this.getEditorUrl(),
            type: this.widgetProps.editorType,
            dispatchEvent: ({ type, payload }) => {
                if (type === CKEditorEventAction.beforeLoad) {
                    this.namespace = payload;
                }
            },
            // Here we ignore hook API and instead use
            // editor instance to subscribe to events.
            config: Object.assign(config, {
                on: {
                    instanceReady(this: CKEditorInstance) {
                        onInstanceReady(this);
                    },
                    pluginsLoaded(this: CKEditorInstance) {
                        onPluginsLoaded(this);
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

    onPluginsLoaded(editor: CKEditorInstance): void {
        this.editor = editor;
        if (this.widgetProps.templates !== "default") {
            const datasource = this.widgetProps.templateDatasource;
            if (datasource === undefined) {
                console.warn("Templates datasource not set for editor " + this.widgetProps.name);
            } else if (datasource.status === ValueStatus.Available && this.namespace !== undefined) {
                console.log("Configuring content templates");
                const CKEDITOR: CKEditorNamespace = this.namespace;
                const contentTemplates: ContentTemplate[] = [];
                const mxObjects = datasource.items;
                if (mxObjects) {
                    mxObjects.forEach(mxObject => {
                        console.info(
                            "Adding template: " + this.widgetProps.templateTitleAttribute.get(mxObject).value ||
                                "<title>"
                        );
                        const contentTemplate: ContentTemplate = new ContentTemplate(
                            this.widgetProps.templateTitleAttribute.get(mxObject).value || "<title>",
                            this.widgetProps.templateDescriptionAttribute.get(mxObject).value || "<description>",
                            this.widgetProps.templateHtmlAttribute.get(mxObject).value || "[html]"
                        );
                        contentTemplates.push(contentTemplate);
                    });
                }
                console.log("Registering templates");
                CKEDITOR.addTemplates(this.widgetProps.templates, {
                    imagesPath: window.location.origin + "/img/",
                    templates: contentTemplates
                });
                console.info("Content templates for " + this.widgetProps.templates + " registered successfully.");
            }
        }
    }

    onDestroy(): void {
        this.editor = null;
    }

    onKeyPress(): void {
        this.widgetProps.onKeyPress?.execute();
    }

    onPasteContent(event: CKEditorEvent): void {
        if (event.data.dataTransfer.isFileTransfer()) {
            for (let i = 0; i < event.data.dataTransfer.getFilesCount(); i++) {
                if (event.data.dataTransfer.getFile(i).size > FILE_SIZE_LIMIT) {
                    this.editor.showNotification(
                        `The image ${
                            event.data.dataTransfer.getFile(i).name
                        } is larger than the 1MB limit. Please choose a smaller image and try again.`,
                        "warning"
                    );
                    event.cancel();
                    break;
                }
            }
        }
    }
    onDropContent(event: CKEditorEvent): void {
        if (event.data.dataTransfer.isFileTransfer()) {
            for (let i = 0; i < event.data.dataTransfer.getFilesCount(); i++) {
                if (event.data.dataTransfer.getFile(i).size > FILE_SIZE_LIMIT) {
                    this.editor.showNotification(
                        `The image ${
                            event.data.dataTransfer.getFile(i).name
                        } is larger than the 1MB limit. Please choose a smaller image and try again.`,
                        "warning"
                    );
                    event.cancel();
                    break;
                }
            }
        }
    }

    onChange(_event: CKEditorEventPayload<"change">): void {
        if (this.editor) {
            const editorData = this.editor.getData();
            const content = this.widgetProps.sanitizeContent ? DOMPurify.sanitize(editorData) : editorData;
            this.lastSentValue = content;
            this.applyChangesDebounce();
        }
    }

    applyChangesImmediately(): void {
        // put last seen content to the attribute if it exists
        if (this.lastSentValue !== undefined) {
            this.widgetProps.stringAttribute.setValue(this.lastSentValue);
            this.widgetProps.onChange?.execute();
        }
    }

    addListeners(): void {
        if (this.editor && !this.editor.readOnly) {
            this.editor.on("change", this.onChange);
            this.editor.on("key", this.onKeyPress);
            this.editor.on("paste", this.onPasteContent);
            this.editor.on("drop", this.onDropContent);
        }
    }

    removeListeners(): void {
        this.editor?.removeListener("change", this.onChange);
        this.editor?.removeListener("key", this.onKeyPress);
        this.editor?.removeListener("paste", this.onPasteContent);
        this.editor?.removeListener("drop", this.onDropContent);
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
            this.setDataDebounce(args.data);
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

    componentDidMount(): void {
        this.cancelRAF = animationLoop(() => {
            if (this.element && this.element.parentElement) {
                const newHasFocus = this.element.parentElement.contains(document.activeElement);
                if (newHasFocus !== this.hasFocus) {
                    this.hasFocus = newHasFocus;
                    if (!this.hasFocus) {
                        // changed from true to false, user left the element, apply changes immediately
                        this.applyChangesImmediately();
                    }
                }
            }
        });
    }

    componentWillUnmount(): void {
        this.cancelRAF?.();
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

function animationLoop(callback: () => void): () => void {
    let requestId: number;

    const requestFrame = () => {
        requestId = window.requestAnimationFrame(() => {
            callback();
            requestFrame();
        });
    };

    requestFrame();

    return () => window.cancelAnimationFrame(requestId);
}
