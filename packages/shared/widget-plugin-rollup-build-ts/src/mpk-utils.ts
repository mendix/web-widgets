import { dirname } from "node:path";
import { mkdirSync } from "node:fs";
import zip from "cross-zip";

type CreateMPKArgs = {
    mpkFile: string;
    clientModuleRootDir: string;
};

export async function createMPK({ mpkFile, clientModuleRootDir }: CreateMPKArgs) {
    mkdirSync(dirname(mpkFile), { recursive: true });

    return new Promise<void>((resolve, reject) => {
        zip.zip(clientModuleRootDir, mpkFile, err => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}
