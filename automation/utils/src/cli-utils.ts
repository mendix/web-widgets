import ora from "ora";

export async function oraPromise<T>(task: Promise<T>, msg: string): Promise<T> {
    const spinner = ora(msg);
    spinner.start();
    const r = await task;
    spinner.stop();
    return r;
}
