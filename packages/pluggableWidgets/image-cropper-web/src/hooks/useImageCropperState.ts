import { Dispatch, RefObject, SetStateAction, useRef, useState } from "react";
import type { Crop, PixelCrop } from "react-image-crop";

interface ImageCropperState {
    crop: Crop | undefined;
    setCrop: Dispatch<SetStateAction<Crop | undefined>>;
    completedCrop: PixelCrop | undefined;
    setCompletedCrop: Dispatch<SetStateAction<PixelCrop | undefined>>;
    zoom: number;
    setZoom: Dispatch<SetStateAction<number>>;
    imageRef: RefObject<HTMLImageElement | null>;
}

export function useImageCropperState(initialZoom: number): ImageCropperState {
    const [crop, setCrop] = useState<Crop | undefined>(undefined);
    const [completedCrop, setCompletedCrop] = useState<PixelCrop | undefined>(undefined);
    const [zoom, setZoom] = useState<number>(initialZoom);
    const imageRef = useRef<HTMLImageElement>(null);
    return { crop, setCrop, completedCrop, setCompletedCrop, zoom, setZoom, imageRef };
}
