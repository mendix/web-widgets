declare module "*.css";
declare module "*.scss";

// Add quill-resize-module declaration
declare module "quill-resize-module" {
    import Quill from "quill";

    interface ResizeModuleOptions {
        modules?: string[];
        handleStyles?: {
            backgroundColor?: string;
            border?: string;
            boxSizing?: string;
        };
        displayStyles?: {
            backgroundColor?: string;
            border?: string;
            color?: string;
        };
        toolbarStyles?: {
            backgroundColor?: string;
            border?: string;
            color?: string;
            boxShadow?: string;
        };
        overlayStyles?: {
            border?: string;
            boxSizing?: string;
        };
        embedTags?: string[];
        tools?: Array<
            | string
            | {
                  text: string;
                  verify: (activeEle: HTMLElement) => boolean;
                  handler: (evt: MouseEvent, button: HTMLElement, activeEle: HTMLElement) => void;
              }
        >;
        locale?: {
            altTip?: string;
            inputTip?: string;
            floatLeft?: string;
            floatRight?: string;
            center?: string;
            restore?: string;
        };
    }

    interface ResizeModuleConstructor {
        new (quill: Quill, options: ResizeModuleOptions): any;
        Modules?: any;
        handleEdit(): void;
    }

    const ResizeModule: ResizeModuleConstructor;
    export default ResizeModule;
}

// Add the dist/resize module declaration
declare module "quill-resize-module/dist/resize" {
    export * from "quill-resize-module";
    export { default } from "quill-resize-module";
}
