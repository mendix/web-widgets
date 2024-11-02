export type linkConfigType = {
    text?: string;
    href: string;
    title?: string;
    target?: string;
};

export type videoConfigType = {
    src: string;
    width: number;
    height: number;
};

export type videoEmbedConfigType = {
    embedcode: string;
};

export type viewCodeConfigType = {
    src: string;
};

export type imageConfigType = {
    files: FileList | File[] | null;
    alt?: string;
    width?: number;
    height?: number;
};
