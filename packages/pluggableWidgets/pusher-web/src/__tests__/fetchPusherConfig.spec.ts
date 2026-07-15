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
        sessionData: { csrftoken: "test-csrf" }
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
