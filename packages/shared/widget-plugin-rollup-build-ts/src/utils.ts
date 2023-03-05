import { green } from "colorette";
import rimraf from "rimraf";

export function cleanup({ dirs, verbose }: { dirs: string[]; verbose: boolean }) {
    rimraf.sync(dirs);
    if (verbose) {
        // Spacing top
        console.log();
        console.log(green(`removed:`));
        for (const dir of dirs) {
            console.log(green(`  ${dir}`));
        }
    }
}
