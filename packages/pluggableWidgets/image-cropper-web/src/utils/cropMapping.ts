// Rotation is supported only at 90° multiples; arbitrary angles are snapped.
export function normalizeRotation(deg: number): 0 | 90 | 180 | 270 {
    const snapped = Math.round(deg / 90) * 90;
    const mod = ((snapped % 360) + 360) % 360;
    return mod as 0 | 90 | 180 | 270;
}

// Destination canvas size after a quarter-turn rotation: 90/270 swap w/h.
export function rotatedCanvasSize(width: number, height: number, rotation: number): { width: number; height: number } {
    const r = normalizeRotation(rotation);
    return r === 90 || r === 270 ? { width: height, height: width } : { width, height };
}
