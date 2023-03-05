import { green } from "colorette";
import rimraf from "rimraf";

export function cleanup({ dirs, verbose }: { dirs: string[]; verbose: boolean }) {
    const removed = rimraf.sync(dirs);
    if (!removed) {
        throw new Error("Failed to cleanup");
    }
    if (verbose && removed) {
        // Spacing top
        console.log();
        console.log(green(`removed:`));
        for (const dir of dirs) {
            console.log(green(`  ${dir}`));
        }
    }
}
