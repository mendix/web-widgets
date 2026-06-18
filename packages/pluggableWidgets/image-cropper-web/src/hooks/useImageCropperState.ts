import { Dispatch, RefObject, SetStateAction, useRef, useState } from "react";
import type { Crop, PixelCrop } from "react-image-crop";

interface ImageCropperState {
    // liveCrop: % units, updated per pointer move (onChange) — survives container resize.
    // committedCrop: px units, set on release (onComplete) — consumed by cropImage/PreviewPane.
    liveCrop: Crop | undefined;
    setLiveCrop: Dispatch<SetStateAction<Crop | undefined>>;
    committedCrop: PixelCrop | undefined;
    setCommittedCrop: Dispatch<SetStateAction<PixelCrop | undefined>>;
    zoom: number;
    setZoom: Dispatch<SetStateAction<number>>;
    grayscale: boolean;
    setGrayscale: Dispatch<SetStateAction<boolean>>;
    imageRef: RefObject<HTMLImageElement | null>;
}

export function useImageCropperState(initialZoom: number): ImageCropperState {
    const [liveCrop, setLiveCrop] = useState<Crop | undefined>(undefined);
    const [committedCrop, setCommittedCrop] = useState<PixelCrop | undefined>(undefined);
    const [zoom, setZoom] = useState<number>(initialZoom);
    const [grayscale, setGrayscale] = useState<boolean>(false);
    const imageRef = useRef<HTMLImageElement>(null);
    return {
        liveCrop,
        setLiveCrop,
        committedCrop,
        setCommittedCrop,
        zoom,
        setZoom,
        grayscale,
        setGrayscale,
        imageRef
    };
}
