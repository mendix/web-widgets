import nodefetch, { BodyInit, RequestInit } from "node-fetch";

export { BodyInit } from "node-fetch";

export async function fetch<T = unknown>(
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
    url: string,
    body?: BodyInit,
    additionalHeaders?: object
): Promise<T> {
    let response: nodefetch.Response;
    const httpsOptions: RequestInit = {
        method,
        redirect: "follow",
        headers: {
            Accept: "application/json",
            ...additionalHeaders,
            ...(body && { "Content-Type": "application/json" })
        },
        body
    };

    const isQuietMode = process.env.FETCH_QUIET === "true";

    if (!isQuietMode) {
        console.log(`Fetching URL (${method}): ${url}`);
    }

    try {
        response = await nodefetch(url, httpsOptions);
    } catch (error) {
        throw new Error(
            `An error occurred while retrieving data from ${url}. Technical error: ${(error as Error).message}`
        );
    }

    if (!isQuietMode) {
        console.log(`Response status Code ${response.status}`);
    }

    if (response.status === 409) {
        throw new Error(
            `Fetching Failed (Code ${response.status}). Possible solution: Check & delete drafts in Mendix Marketplace.`
        );
    } else if (response.status === 503) {
        throw new Error(`Fetching Failed. "${url}" is unreachable (Code ${response.status}).`);
    } else if (response.status === 400) {
        console.error(await response.text());
        throw new Error(`Fetching Failed (Code ${response.status}). ${response.statusText}`);
    } else if (response.status !== 200 && response.status !== 201) {
        throw new Error(`Fetching Failed (Code ${response.status}). ${response.statusText}`);
    } else if (response.ok) {
        return response.json();
    } else {
        throw new Error(`Fetching Failed (Code ${response.status}). ${response.statusText}`);
    }
}
