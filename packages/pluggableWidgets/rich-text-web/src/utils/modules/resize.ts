import QuillResize from "quill-resize-module";

type sizeType = {
    width?: number;
    height?: number;
};
type resultSizeType =
    | sizeType
    | {
          width?: string;
          height?: string;
      };

type limitType = {
    ratio?: number;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    unit?: string;
};

type eventType = { clientX: number; clientY: number };
// eslint-disable-next-line no-unsafe-optional-chaining
export default class MxResize extends QuillResize.Modules.Resize {
    // modified from https://github.com/mudoo/quill-resize-module/blob/master/src/modules/Resize.js
    calcSize(evt: eventType, limit: limitType = {}): resultSizeType {
        // update size
        const deltaX = evt.clientX - this.dragStartX;
        const deltaY = evt.clientY - this.dragStartY;

        const size: sizeType = {};
        let direction = 1;

        (this.blotOptions.attribute || ["width"]).forEach((key: "width" | "height") => {
            size[key] = this.preDragSize[key];
        });

        const allowHeight =
            this.activeEle.getAttribute("height") !== undefined && this.activeEle.getAttribute("height") !== null;
        if (!allowHeight) {
            delete size.height;
        }

        // left-side
        if (this.dragBox === this.boxes[0] || this.dragBox === this.boxes[3]) {
            direction = -1;
        }

        if (size.width) {
            size.width = Math.round(this.preDragSize.width + deltaX * direction);
        }
        if (size.height) {
            size.height = Math.round(this.preDragSize.height + deltaY * direction);
        }

        let { width, height } = size;

        // keep ratio
        if (limit.ratio) {
            let limitHeight;
            if (limit.minWidth) width = Math.max(limit.minWidth, width!);
            if (limit.maxWidth) width = Math.min(limit.maxWidth, width!);

            height = width! * limit.ratio;

            if (limit.minHeight && height < limit.minHeight) {
                limitHeight = true;
                height = limit.minHeight;
            }
            if (limit.maxHeight && height > limit.maxHeight) {
                limitHeight = true;
                height = limit.maxHeight;
            }

            if (limitHeight) {
                width = height / limit.ratio;
            }
        } else {
            if (size.width) {
                if (limit.minWidth) width = Math.max(limit.minWidth, width!);
                if (limit.maxWidth) width = Math.min(limit.maxWidth, width!);
            }
            if (size.height) {
                if (limit.minHeight) height = Math.max(limit.minHeight, height!);
                if (limit.maxHeight) height = Math.min(limit.maxHeight, height!);
            }
        }
        const res: resultSizeType = {};

        if (limit.unit) {
            if (width) res.width = width + "px";
            if (height) res.height = height + "px";
        } else {
            if (width) res.width = width;
            if (height) res.height = height;
        }
        return res;
    }
}
