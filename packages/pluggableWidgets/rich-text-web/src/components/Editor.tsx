import { debounce } from "@mendix/pluggable-widgets-commons";
import { CKEditorEventPayload, CKEditorHookProps, CKEditorInstance } from "ckeditor4-react";
import { Component, createElement } from "react";
import { RichTextContainerProps } from "../../typings/RichTextProps";
import { getCKEditorConfig } from "../utils/ckeditorConfigs";
import { MainEditor } from "./MainEditor";
import DOMPurify from "dompurify";

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

export class Editor extends Component<EditorProps> {
    widgetProps: RichTextContainerProps;
    editor: CKEditorInstance | null;
    editorHookProps: EditorHookProps;
    editorKey: number;
    editorScript = "widgets/ckeditor/ckeditor.js";
    element: HTMLElement;
    lastSentValue: string | undefined;
    applyChangesDebounce: () => void;
    cancelRAF: (() => void) | undefined;
    hasFocus: boolean;
    uploadedImages: string[] = [];

    constructor(props: EditorProps) {
        super(props);
        // Props are read only, so, make a copy;
        this.widgetProps = { ...this.props.widgetProps };
        this.element = this.props.element;
        this.editorKey = this.getNewKey();
        this.editorHookProps = this.getNewEditorHookProps();
        this.onChange = this.onChange.bind(this);
        this.applyChangesDebounce = debounce(this.applyChangesImmediately.bind(this), 500);
        this.onKeyPress = this.onKeyPress.bind(this);
        this.onDropOrPastedFile = this.onDropOrPastedFile.bind(this);
        this.hasFocus = false;
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

            if (key === "onChange") {
                return false;
            }

            if (key === "onKeyPress") {
                return false;
            }

            if (key === "uploadedImages") {
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

        // By default CKEditor puts the width and height in style which cause problem after sanitization.
        // So we disallow width and height in style and use properties instead
        if (this.widgetProps.enableUploadImages) {
            config.extraAllowedContent = { img: { attributes: [] }, ...config.extraAllowedContent };
            config.extraAllowedContent.img.attributes = [
                ...config.extraAllowedContent.img.attributes,
                "width",
                "height"
            ];
            config.disallowedContent = { img: { styles: [] }, ...config.disallowedContent };
            config.disallowedContent.img.styles = [...config.disallowedContent.img.styles, "width", "height"];
        }

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
        this.updateImageList(this.widgetProps.stringAttribute.value);
    }

    onDestroy(): void {
        this.editor = null;
    }

    onKeyPress(): void {
        this.widgetProps.onKeyPress?.execute();
    }

    onDropOrPastedFile(event: CKEditorEvent): void {
        if (event.data.dataTransfer.isFileTransfer()) {
            for (let i = 0; i < event.data.dataTransfer.getFilesCount(); i++) {
                const file = event.data.dataTransfer.getFile(i);
                if (this.widgetProps.enableUploadImages) {
                    this.uploadImageToDialog(file);
                    event.cancel();
                } else if (file.size > FILE_SIZE_LIMIT) {
                    this.editor.showNotification(
                        `The image ${file.name} is larger than the 1MB limit. Please choose a smaller image and try again.`,
                        "warning"
                    );
                    event.cancel();
                    break;
                }
            }
        }
    }

    uploadImageToDialog(file: File): void {
        this.editor.openDialog("image", (dialog: any): void => {
            window
                .fetch(this.widgetProps.uploadImageEndpoint, {
                    method: "POST",
                    body: file,
                    headers: {
                        Origin: window.location.origin,
                        "Content-Type": "text/html",
                        "x-csrf-token": window.mx ? window.mx.session.getConfig("csrftoken") : ""
                    }
                })
                .then(response => {
                    if (!response.ok || response.status >= 400) {
                        throw Error(
                            JSON.stringify({
                                status: response.status,
                                statusText: response.statusText,
                                ok: response.ok,
                                body: response.body
                            })
                        );
                    }
                    return response.text();
                })
                .then(imagePath => {
                    if (!imagePath) {
                        return;
                    }

                    let succeed = false;
                    let tryCount = 0;
                    const intervalId = window.setInterval(() => {
                        succeed = this.updateImageDialog(dialog, imagePath, file.name);
                        if (succeed || tryCount === 10) {
                            window.clearInterval(intervalId);
                        } else {
                            tryCount++;
                        }
                    }, 300);
                });
        });
    }

    updateImageDialog(dialog: any, imagePath: string, fileName: string): boolean {
        // Fill target elements in image dialog
        const targetPage = "info";
        const targetElement = "txtUrl";
        const targetAlt = "txtAlt";

        const element = dialog.getContentElement(targetPage, targetElement);
        if (!element) {
            return false;
        }
        element.setValue(imagePath);
        dialog.selectPage(targetPage);

        const altElement = dialog.getContentElement(targetPage, targetAlt);
        if (altElement) {
            altElement.setValue(fileName);
        }
        return true;
    }

    onChange(_event: CKEditorEventPayload<"change">): void {
        if (this.editor) {
            const editorData = this.editor.getData();
            const content = this.widgetProps.sanitizeContent ? DOMPurify.sanitize(editorData) : editorData;
            this.lastSentValue = content;
            this.applyChangesDebounce();
            if (this.widgetProps.enableUploadImages) {
                this.updateImageList(content);
            }
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
            this.editor.on("paste", this.onDropOrPastedFile);
            this.editor.on("drop", this.onDropOrPastedFile);
            if (this.widgetProps.enableUploadImages) {
                this.editor.uploadImageEndpoint = this.widgetProps.uploadImageEndpoint;
                this.editor.uploadImageMaxSize = this.widgetProps.uploadImageMaxSize;
            }
        }
    }

    removeListeners(): void {
        this.editor?.removeListener("change", this.onChange);
        this.editor?.removeListener("key", this.onKeyPress);
        this.editor?.removeListener("paste", this.onDropOrPastedFile);
        this.editor?.removeListener("drop", this.onDropOrPastedFile);
    }

    updateImageList(content: string | undefined): void {
        if (!this.widgetProps.enableUploadImages || !this.widgetProps.uploadedImages || !content) {
            return;
        }

        const matches = content.matchAll(/<img.*?src="(.*?)"/g);
        this.uploadedImages = [];
        for (const match of matches) {
            if (match.length > 0) {
                this.uploadedImages.push(match[1]);
            }
        }
        this.widgetProps.uploadedImages.setValue(this.uploadedImages.join(","));
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

    const requestFrame = (): void => {
        requestId = window.requestAnimationFrame(() => {
            callback();
            requestFrame();
        });
    };

    requestFrame();

    return () => window.cancelAnimationFrame(requestId);
}
