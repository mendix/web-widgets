import { Component, createElement, ReactNode } from "react";

import { Dimensions } from "./SizeContainer";
import Utils from "../utils/Utils";
import { penOptions, Signature } from "./Signature";

interface WrapperProps {
    class: string;
    mxObject?: mendix.lib.MxObject;
    mxform: mxui.lib.form._FormBase;
    style?: string;
    friendlyId: string;
    readOnly: boolean;
}

export interface SignatureContainerProps extends WrapperProps, Dimensions {
    hasSignatureAttribute: string;
    showGrid: boolean;
    gridBorderColor: string;
    gridCellHeight: number;
    gridCellWidth: number;
    gridBorderWidth: number;
    penType: penOptions;
    penColor: string;
}

interface SignatureContainerState {
    alertMessage: string;
    hasSignature: boolean;
}

export default class SignatureContainer extends Component<SignatureContainerProps, SignatureContainerState> {
    private subscriptionHandles: number[] = [];
    private base64Uri = "";
    private formHandle?: number;

    readonly state = {
        alertMessage: "",
        hasSignature: false
    };

    constructor(props: SignatureContainerProps) {
        super(props);
        this.resetSubscriptions(props.mxObject);
    }

    render(): ReactNode {
        return createElement(Signature, {
            ...(this.props as SignatureContainerProps),
            wrapperStyle: Utils.parseStyle(this.props.style),
            readOnly: this.isReadOnly(),
            alertMessage: this.state.alertMessage,
            clearSignature: this.state.hasSignature,
            onSignEndAction: this.handleSignEnd,
            className: this.props.class
        });
    }

    UNSAFE_componentWillReceiveProps(newProps: SignatureContainerProps): void {
        if (newProps.mxObject) {
            const alertMessage = this.validateProps(newProps.mxObject);

            if (alertMessage) {
                this.setState({ alertMessage });
            }
        }
    }

    componentDidUpdate(): void {
        this.resetSubscriptions(this.props.mxObject);
    }

    componentDidMount(): void {
        this.formHandle = this.props.mxform.listen("submit", callback => this.saveDocument(callback));
    }

    componentWillUnmount(): void {
        if (this.formHandle) {
            this.props.mxform.unlisten(this.formHandle);
        }
        this.subscriptionHandles.forEach(window.mx.data.unsubscribe);
    }

    private handleSignEnd = (base64Uri: string): void => {
        const { mxObject } = this.props;

        if (mxObject && !this.state.hasSignature) {
            mxObject.set(this.props.hasSignatureAttribute, true);
        }
        this.base64Uri = base64Uri;
        if (base64Uri) {
            this.setState({ hasSignature: true });
        }
    };

    private isReadOnly(): boolean {
        const { mxObject, readOnly } = this.props;

        return !mxObject || readOnly || mxObject.isReadonlyAttr("Contents");
    }

    private saveDocument(callback: () => void): void {
        if (this.base64Uri && this.state.hasSignature && this.props.mxObject) {
            const error = function (callback: any): void {
                return mx.ui.error("Error saving signature: " + callback.message);
            };
            // @ts-expect-error cordova specific code
            const cdv = window.cordova;
            if (cdv) {
                // @ts-expect-error cordova specific code
                const options = new FileUploadOptions();
                options.fileKey = "blob";
                options.fileName = this.generateFileName(this.props.mxObject);
                options.mimeType = "image/png";
                options.chunkedMode = false;
                const headers = {
                    Accept: "application/json",
                    // @ts-expect-error cordova specific code
                    "X-Csrf-Token": mx.session.sessionData.csrftoken,
                    "X-Mx-ReqToken": new Date().getTime()
                };
                options.headers = headers;
                const isHttps = mx.remoteUrl.includes("https");
                const remoteUrlWithoutScheme = decodeURIComponent(mx.remoteUrl.replace(/.*_http[s]?_proxy_/, ""));
                const remoteUrl = (isHttps ? "https://" : "http://") + remoteUrlWithoutScheme;
                const guid = this.props.mxObject.getGuid();
                const dataUri = this.base64Uri;

                mx.data.commit({
                    mxobj: this.props.mxObject,
                    callback() {
                        // @ts-expect-error cordova specific code
                        const ft = new FileTransfer();
                        const fileUploadUrl = remoteUrl + "file?guid=" + guid;
                        ft.upload(dataUri, fileUploadUrl, callback, error, options);
                    },
                    error
                });
            } else {
                mx.data.saveDocument(
                    this.props.mxObject.getGuid(),
                    this.generateFileName(this.props.mxObject),
                    {},
                    Utils.convertUrlToBlob(this.base64Uri),
                    callback,
                    error => mx.ui.error("Error saving signature: " + error.message)
                );
            }
        } else {
            callback();
        }
    }

    private generateFileName(mxObject: mendix.lib.MxObject): string {
        const currentName = mxObject.get("Name") as string;
        if (currentName) {
            return currentName;
        }
        return `signature${Math.floor(Math.random() * 1000000)}.png`;
    }

    validateProps(mxObject: mendix.lib.MxObject): string {
        let errorMessage = "";

        if (mxObject && !mxObject.inheritsFrom("System.Image")) {
            errorMessage = `${this.props.friendlyId}: ${mxObject.getEntity()} does not inherit from "System.Image".`;
        }

        return errorMessage;
    }

    private resetSubscriptions(mxObject?: mendix.lib.MxObject): void {
        this.subscriptionHandles.forEach(window.mx.data.unsubscribe);
        this.subscriptionHandles = [];

        if (mxObject) {
            this.subscriptionHandles.push(
                window.mx.data.subscribe({
                    guid: mxObject.getGuid(),
                    callback: () => this.updateCanvasState()
                })
            );
            this.subscriptionHandles.push(
                mx.data.subscribe({
                    guid: mxObject.getGuid(),
                    attr: this.props.hasSignatureAttribute,
                    callback: () => this.updateCanvasState()
                })
            );
        }
    }

    private updateCanvasState = (): void => {
        const { mxObject, hasSignatureAttribute } = this.props;
        if (hasSignatureAttribute) {
            const hasSignature = !!mxObject && (mxObject.get(hasSignatureAttribute) as boolean);
            if (this.state.hasSignature !== hasSignature) {
                this.setState({ hasSignature });
            }
        }
    };
}
