/**
 * Utility function to format file size into human-readable string.
 * It uses IEC 60027 standard, meaning the number is divided by 1024 for each unit.
 * And prefixes are B, KB, MB, GB, TB, PB, EB, ZB, YB.
 * While the prefixes are not technically correct, they are widely used in the industry.
 */
export function fileSize(size: number): string {
    if (size < 0) {
        return "";
    }

    const units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size = size / 1024;
        unitIndex++;
    }

    const formattedSize =
        size < 10 && size % 1 > 0.005
            ? size.toFixed(2)
            : size < 100 && size % 1 > 0.05
              ? size.toFixed(1)
              : Math.floor(size);

    return `${formattedSize} ${units[unitIndex]}`;
}
