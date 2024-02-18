
import tinymce from "tinymce";

export interface MXGlobalObject {
    remoteUrl: string;
}

declare global {
    interface Window {
        mx: MXGlobalObject;
    }
    var tinymce = tinymce;
}
