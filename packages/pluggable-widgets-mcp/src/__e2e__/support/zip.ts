/**
 * Reads the file names out of a zip archive by walking its central directory.
 *
 * An .mpk is a zip. Checking that one exists proves nothing — the question is whether Studio Pro can
 * load it, which comes down to whether the expected entries are inside at the expected paths.
 *
 * Implemented here rather than shelling out to `unzip`, which is absent on Windows, and rather than
 * adding a dependency for thirty lines of header parsing. Only the names are needed; nothing is
 * decompressed.
 */

const END_OF_CENTRAL_DIRECTORY = 0x06054b50;
const CENTRAL_FILE_HEADER = 0x02014b50;

/** Locates the end-of-central-directory record, which sits at the tail, after any comment. */
function findEndOfCentralDirectory(buffer: Buffer): number {
    // The comment is at most 0xffff bytes, and the record itself is 22.
    const earliest = Math.max(0, buffer.length - 0xffff - 22);
    for (let i = buffer.length - 22; i >= earliest; i--) {
        if (buffer.readUInt32LE(i) === END_OF_CENTRAL_DIRECTORY) return i;
    }
    return -1;
}

export function readZipEntryNames(buffer: Buffer): string[] {
    const eocd = findEndOfCentralDirectory(buffer);
    if (eocd < 0) {
        throw new Error("not a zip archive: no end-of-central-directory record found");
    }

    const entryCount = buffer.readUInt16LE(eocd + 10);
    let offset = buffer.readUInt32LE(eocd + 16);

    const names: string[] = [];
    for (let i = 0; i < entryCount; i++) {
        if (buffer.readUInt32LE(offset) !== CENTRAL_FILE_HEADER) {
            throw new Error(`corrupt zip: expected a central directory header at byte ${offset}`);
        }
        const nameLength = buffer.readUInt16LE(offset + 28);
        const extraLength = buffer.readUInt16LE(offset + 30);
        const commentLength = buffer.readUInt16LE(offset + 32);

        names.push(buffer.toString("utf-8", offset + 46, offset + 46 + nameLength));
        offset += 46 + nameLength + extraLength + commentLength;
    }

    return names.sort();
}
