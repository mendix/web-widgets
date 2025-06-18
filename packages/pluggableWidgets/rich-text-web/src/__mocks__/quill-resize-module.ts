// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class QuillResizeToolbar {
    constructor() {
        return this;
    }
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class QuillResizeResize {
    constructor() {
        return this;
    }
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class QuillResize {
    static Modules = {
        Toolbar: QuillResizeToolbar,
        Resize: QuillResizeResize
    };
    constructor() {
        return this;
    }
}
