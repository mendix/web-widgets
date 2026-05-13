// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class Utils {
    static convertUrlToBlob(base64Uri: string, fileName: string): File {
        const contentType = "image/png";
        const sliceSize = 512;
        const byteCharacters = atob(base64Uri.split(";base64,")[1]);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: contentType });
        const fullFileName = fileName.endsWith(".png") ? fileName : `${fileName}.png`;
        return new File([blob], fullFileName, { type: contentType });
    }

    static generateFileName(prefix: string): string {
        // Auto-generate filename with format and hash
        const timestamp = Utils.generateTimestamp();
        return `${prefix}_${timestamp}.png`;
    }

    static generateTimestamp(): string {
        // Get current date and time
        const now = new Date();

        // Format: YYYYMMDD_HHMMSS
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");

        return `${year}${month}${day}_${hours}${minutes}${seconds}`;
    }
}
