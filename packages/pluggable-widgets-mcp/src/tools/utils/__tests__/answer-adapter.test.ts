import { describe, expect, it, vi } from "vitest";
import { AnswerAdapter, InvalidAnswerError, MissingAnswerError } from "@/tools/utils/answer-adapter";

describe("AnswerAdapter.prompt", () => {
    it("uses the supplied answer over the prompt default", async () => {
        const adapter = new AnswerAdapter({ name: "MyWidget" });
        const answers = await adapter.prompt([{ name: "name", default: "DefaultWidget" }]);
        expect(answers.name).toBe("MyWidget");
    });

    it("falls back to the prompt default when no answer is supplied", async () => {
        const adapter = new AnswerAdapter({});
        const answers = await adapter.prompt([{ name: "license", default: "Apache-2.0" }]);
        expect(answers.license).toBe("Apache-2.0");
    });

    it("resolves function-valued defaults against the answers so far", async () => {
        const adapter = new AnswerAdapter({ boilerplate: "full" });
        const answers = await adapter.prompt([
            { name: "boilerplate" },
            { name: "hasUnitTests", default: (a: Record<string, unknown>) => a.boilerplate === "full" }
        ]);
        expect(answers.hasUnitTests).toBe(true);
    });

    it("throws when a prompt has neither an answer nor a default", async () => {
        const adapter = new AnswerAdapter({});
        await expect(adapter.prompt([{ name: "somethingNew", message: "What now?" }])).rejects.toBeInstanceOf(
            MissingAnswerError
        );
    });

    it("throws when the generator's own validate rejects the value", async () => {
        const adapter = new AnswerAdapter({ name: "not valid!" });
        await expect(
            adapter.prompt([{ name: "name", validate: () => "may only contain [a-zA-Z]" }])
        ).rejects.toBeInstanceOf(InvalidAnswerError);
    });

    it("honours a `when` guard so conditional prompts are not demanded", async () => {
        const adapter = new AnswerAdapter({ platform: "native" });
        const answers = await adapter.prompt([
            { name: "platform" },
            { name: "hasE2eTests", when: (a: Record<string, unknown>) => a.platform === "web" }
        ]);
        expect(answers).not.toHaveProperty("hasE2eTests");
        expect(adapter.askedFor).toEqual(["platform"]);
    });

    it("records every prompt it was asked, in order", async () => {
        const adapter = new AnswerAdapter({ a: 1, b: 2 });
        await adapter.prompt([{ name: "a" }, { name: "b" }]);
        expect(adapter.askedFor).toEqual(["a", "b"]);
    });

    it("never writes to stdout — that channel carries MCP JSON-RPC", () => {
        const stdout = vi.spyOn(process.stdout, "write").mockReturnValue(true);
        vi.spyOn(console, "error").mockImplementation(() => undefined);

        const adapter = new AnswerAdapter({});
        adapter.log("a banner");
        adapter.log.create("src/Widget.tsx");
        adapter.log.error("something broke");
        adapter.log.colored([{ message: "coloured" }]);

        expect(stdout).not.toHaveBeenCalled();
    });

    it("routes generator output to stderr, with routine detail at debug level", () => {
        vi.spyOn(process.stdout, "write").mockReturnValue(true);
        const stderr = vi.spyOn(console, "error").mockImplementation(() => undefined);

        const adapter = new AnswerAdapter({});

        // Per-file chatter is debug, so it is filtered at the default level...
        adapter.log.create("src/Widget.tsx");
        expect(stderr).not.toHaveBeenCalled();

        // ...but the generator's own errors always surface.
        adapter.log.error("template render failed");
        expect(stderr).toHaveBeenCalledWith(expect.stringContaining("template render failed"));
    });
});
