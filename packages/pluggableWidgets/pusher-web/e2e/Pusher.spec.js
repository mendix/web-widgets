import { createHmac } from "node:crypto";
import { test, expect } from "@mendix/run-e2e/fixtures";

// The test project's Pusher constants: key "e2e-key", secret "e2e-secret", cluster "e2e".
const SOCKET_ID = "1234.5678";

/**
 * Stands in for the Pusher service (protocol 7) at the WebSocket boundary. The widget still fetches the key
 * from the app and gets its channel signed by the app's auth endpoint.
 */
async function mockPusher(page) {
    let resolveSubscription;
    const subscription = new Promise(resolve => {
        resolveSubscription = resolve;
    });

    await page.routeWebSocket(/ws-e2e\.pusher\.com/, ws => {
        ws.send(
            JSON.stringify({
                event: "pusher:connection_established",
                data: JSON.stringify({ socket_id: SOCKET_ID, activity_timeout: 120 })
            })
        );
        ws.onMessage(message => {
            const { event, data } = JSON.parse(message);
            if (event === "pusher:ping") {
                ws.send(JSON.stringify({ event: "pusher:pong", data: {} }));
            }
            if (event === "pusher:subscribe") {
                ws.send(
                    JSON.stringify({
                        event: "pusher_internal:subscription_succeeded",
                        channel: data.channel,
                        data: "{}"
                    })
                );
                resolveSubscription({ ...data, ws });
            }
        });
    });

    return {
        subscription,
        async trigger(eventName) {
            const { channel, ws } = await subscription;
            ws.send(JSON.stringify({ event: eventName, channel, data: "{}" }));
        }
    };
}

test.describe("pusher-web", () => {
    let pusher;

    test.beforeEach(async ({ page }) => {
        pusher = await mockPusher(page);
        await page.goto("/");
    });

    test("subscribes to the private channel of its object with the app's signature", async () => {
        const { channel, auth } = await pusher.subscription;

        expect(channel).toMatch(/^private-MyFirstModule\.Ticket\.\d+$/);
        const signature = createHmac("sha256", "e2e-secret").update(`${SOCKET_ID}:${channel}`).digest("hex");
        expect(auth).toBe(`e2e-key:${signature}`);
    });

    test("runs the action of the handler for a received event", async ({ page }) => {
        await pusher.trigger("Refresh");

        await expect(page.locator(".mx-name-textLog")).toHaveText("Log: Refresh;");
    });

    test("runs the handler that matches each event name", async ({ page }) => {
        await pusher.trigger("Close");
        await expect(page.locator(".mx-name-textLog")).toHaveText("Log: Close;");

        await pusher.trigger("Refresh");
        await expect(page.locator(".mx-name-textLog")).toHaveText("Log: Close;Refresh;");
    });

    test("ignores events without a handler", async ({ page }) => {
        await pusher.trigger("Archive");
        await pusher.trigger("Close");

        await expect(page.locator(".mx-name-textLog")).toHaveText("Log: Close;");
    });
});
