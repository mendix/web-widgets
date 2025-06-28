import { Range } from "quill/core/selection";
import Uploader from "quill/modules/uploader";
import { ACTION_DISPATCHER } from "../helpers";

class MxUploader extends Uploader {
    protected useEntityUpload: boolean = false;

    setEntityUpload(useEntityUpload: boolean): void {
        this.useEntityUpload = useEntityUpload;
    }

    upload(range: Range, files: FileList | File[]): void {
        if (!this.quill.scroll.query("image")) {
            return;
        }
        if (this.useEntityUpload) {
            // If entity upload is enabled, the file will be handled by external widget's upload handler.
            const dataTransfer = new DataTransfer();
            Array.from(files).forEach(file => {
                if (file && this.options.mimetypes?.includes(file.type)) {
                    dataTransfer.items.add(file);
                }
            });
            const imageInfo = {
                type: "image",
                files: dataTransfer.files
            };
            this.quill.emitter.emit(ACTION_DISPATCHER, imageInfo);
        } else {
            super.upload.call(this, range, files);
        }
    }
}

export default MxUploader;
