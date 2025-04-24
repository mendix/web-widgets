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

ImageViewer.contentTypes = ["image/*"];

ImageViewer.fileTypes = ["jpg", "jpe", "jpeg", "png", "gif", "bmp", "tif", "tiff", "webp"];

export default ImageViewer;
