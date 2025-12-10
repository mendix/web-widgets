import { ActionValue, ListActionValue, ObjectItem } from "mendix";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { FileUploaderContainerProps } from "../../typings/FileUploaderProps";

type UpdateProps = Pick<
    FileUploaderContainerProps,
    | "uploadMode"
    | "createFileAction"
    | "createImageAction"
    | "onUploadFailureFile"
    | "onUploadSuccessFile"
    | "onUploadFailureImage"
    | "onUploadSuccessImage"
>;

export class ObjectCreationHelper {
    private objectCreationAction?: ActionValue;
    private onUploadFailure?: ListActionValue;
    private onUploadSuccess?: ListActionValue;
    private requestingEnabled = false;
    private currentWaiting: Array<[(v: ObjectItem) => void, (e: Error) => void]> = [];
    private itemCreationTimer?: number = undefined;

    private widgetName: string;
    private actionTimeoutInSeconds: number;

    constructor(widgetName: string, timeout: number) {
        this.widgetName = widgetName;
        this.actionTimeoutInSeconds = timeout;
    }

    get canCreateFiles(): boolean {
        return !!this.objectCreationAction && this.objectCreationAction.canExecute;
    }

    enable(): void {
        if (!this.requestingEnabled) {
            this.requestingEnabled = true;
            this.executeCreation();
        }
    }

    updateProps(props: UpdateProps): void {
        if (props.uploadMode === "files") {
            this.objectCreationAction = props.createFileAction;
            this.onUploadFailure = props.onUploadFailureFile;
            this.onUploadSuccess = props.onUploadSuccessFile;
        } else {
            this.objectCreationAction = props.createImageAction;
            this.onUploadFailure = props.onUploadFailureImage;
            this.onUploadSuccess = props.onUploadSuccessImage;
        }
    }

    request(): Promise<ObjectItem> {
        if (!this.canCreateFiles) {
            return Promise.reject(new Error("Object creation action is not available."));
        }

        return new Promise<ObjectItem>((resolve, reject) => {
            this.currentWaiting.push([resolve, reject]);

            this.executeCreation();
        });
    }

    processEmptyObjectItem(item: ObjectItem): void {
        // clear timeout
        clearTimeout(this.itemCreationTimer);
        this.itemCreationTimer = undefined;

        // send item to the promise
        const firstWaiting = this.currentWaiting.shift();
        if (firstWaiting) {
            firstWaiting[0](item);
        }

        this.executeCreation();
    }

    reportCreationFailure(): void {
        console.warn(`File object creation has failed.`);
    }

    reportUploadFailure(item: ObjectItem): void {
        console.warn(`Uploading file content to ${item.id} has failed.`);
        executeAction(this.onUploadFailure?.get(item));
    }

    reportUploadSuccess(item: ObjectItem): void {
        executeAction(this.onUploadSuccess?.get(item));
    }

    private executeCreation(): void {
        if (!this.requestingEnabled) {
            // we are not yet able to create objects, wait till next run
            return;
        }
        if (this.itemCreationTimer) {
            // there is a request in the flight, wait till next run
            return;
        }

        if (!this.currentWaiting.length) {
            // there are no requests in line, wait till next run
            return;
        }

        // we need to check if creation is taking too much time
        // start the timer to measure how long it takes,
        // if a threshold is reached, declare it a failure
        // this means the action is probably misconfigured.
        this.itemCreationTimer = setTimeout(() => {
            this.logCreationError();

            // reject all waiting
            while (this.currentWaiting.length) {
                this.currentWaiting.shift()?.[1](
                    new Error(`Unable to create a new object within ${this.actionTimeoutInSeconds} seconds`)
                );
            }
        }, this.actionTimeoutInSeconds * 1000) as any as number;

        this.objectCreationAction!.execute();
    }

    private logCreationError(): void {
        console.error(
            `Looks like the 'Action to create new files/images' action did not create any objects within ${this.actionTimeoutInSeconds} seconds. Please check if '${this.widgetName}' widget is configured correctly.`
        );
    }
}
