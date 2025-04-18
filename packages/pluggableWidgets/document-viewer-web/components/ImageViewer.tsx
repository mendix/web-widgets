import { createElement } from "react";
import { BaseControlViewer } from "./BaseViewer";
import { DocRendererElement, DocumentRendererProps } from "./documentRenderer";

const ImageViewer: DocRendererElement = (props: DocumentRendererProps) => {
    const { file } = props;

    return (
        <BaseControlViewer {...props} file={file}>
            <img src={file.value?.uri} alt="Image" className="image-viewer-content" />
        </BaseControlViewer>
    );
};

ImageViewer.contentTypes = ["image/*", "image/jpeg", "image/png", "image/gif", "image/bmp", "image/tiff", "image/webp"];

ImageViewer.fileTypes = ["jpg", "jpeg", "png", "gif", "bmp", "tiff", "webp"];

export default ImageViewer;
