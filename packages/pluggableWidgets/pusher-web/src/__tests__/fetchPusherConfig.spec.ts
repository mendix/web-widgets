import { fetchPusherConfig } from "../utils/fetchPusherConfig";

function mockFetch(status: number, body: unknown): void {
    global.fetch = jest.fn().mockResolvedValue({
        status,
        json: () => Promise.resolve(body)
    });
}

beforeEach(() => {
    (window as any).mx = {
        remoteUrl: "https://app.example.com/",
        session: {
            sessionData: { csrftoken: "test-csrf" },
            getConfig: (key: string) => (key === "csrftoken" ? "test-csrf" : undefined)
        }
    };
});

afterEach(() => {
    delete (window as any).mx;
    jest.resetAllMocks();
});

describe("fetchPusherConfig", () => {
    it("returns config on successful response", async () => {
        mockFetch(200, { key: "app-key", cluster: "eu" });

        const result = await fetchPusherConfig(new AbortController().signal);

        expect(result).toEqual({
            key: "app-key",
            cluster: "eu",
            authEndpoint: "https://app.example.com/rest/pusher/auth",
            csrfToken: "test-csrf"
        });
    });

    it("sends the CSRF token from the session in the key request", async () => {
        mockFetch(200, { key: "app-key", cluster: "eu" });

        await fetchPusherConfig(new AbortController().signal);

        expect(global.fetch).toHaveBeenCalledWith(
            "https://app.example.com/rest/pusher/key",
            expect.objectContaining({ headers: { "X-Csrf-Token": "test-csrf" } })
        );
    });

    it("falls back to session data when getConfig is not available", async () => {
        (window as any).mx.session = { sessionData: { csrftoken: "fallback-csrf" } };
        mockFetch(200, { key: "app-key", cluster: "eu" });

        const result = await fetchPusherConfig(new AbortController().signal);

        expect(result?.csrfToken).toBe("fallback-csrf");
    });

    it("falls back to session data when getConfig throws", async () => {
        (window as any).mx.session = {
            sessionData: { csrftoken: "fallback-csrf" },
            getConfig: () => {
                throw new Error("Session is not available");
            }
        };
        mockFetch(200, { key: "app-key", cluster: "eu" });

        const result = await fetchPusherConfig(new AbortController().signal);

        expect(result?.csrfToken).toBe("fallback-csrf");
    });

    it("ignores the legacy mx.sessionData location", async () => {
        (window as any).mx = { remoteUrl: "https://app.example.com/", sessionData: { csrftoken: "legacy" } };
        mockFetch(200, { key: "app-key", cluster: "eu" });

        const result = await fetchPusherConfig(new AbortController().signal);

        expect(result?.csrfToken).toBe("");
    });

    it("returns null on non-200 response", async () => {
        mockFetch(403, {});

        const result = await fetchPusherConfig(new AbortController().signal);

        expect(result).toBeNull();
    });

    it("returns null on network error", async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error("Network failure"));

        const result = await fetchPusherConfig(new AbortController().signal);

        expect(result).toBeNull();
    });

    it("returns null when signal is already aborted", async () => {
        const controller = new AbortController();
        const abortError = new DOMException("Aborted", "AbortError");
        global.fetch = jest.fn().mockRejectedValue(abortError);
        controller.abort();

        const result = await fetchPusherConfig(controller.signal);

        expect(result).toBeNull();
    });

    it("returns null when response is missing required fields", async () => {
        mockFetch(200, { key: "app-key" }); // missing cluster

        const result = await fetchPusherConfig(new AbortController().signal);

        expect(result).toBeNull();
    });
});
