jest.mock("mendix", () => ({}), { virtual: true });
jest.mock("../DSExportRequest");

import { list } from "@mendix/widget-plugin-test-utils";
import { TaskProgressService } from "@mendix/widget-plugin-grid/main";
import { ExportController } from "../ExportController";
import { DSExportRequest } from "../DSExportRequest";
import { column } from "../../../utils/test-utils";

const MockDSExportRequest = DSExportRequest as jest.MockedClass<typeof DSExportRequest>;

function makeMockProgress(): TaskProgressService {
    return {
        inProgress: false,
        lengthComputable: false,
        loaded: 0,
        total: 0,
        onloadstart: jest.fn(),
        onprogress: jest.fn(),
        onloadend: jest.fn()
    };
}

function makeMockRequest(overrides?: { status?: string; loaded?: number }): Partial<DSExportRequest> {
    return {
        status: (overrides?.status ?? "end") as DSExportRequest["status"],
        loaded: overrides?.loaded ?? 10,
        limit: 100,
        send: jest.fn().mockResolvedValue(undefined),
        on: jest.fn().mockReturnValue(jest.fn()),
        abort: jest.fn(),
        onsourcechange: jest.fn(),
        onpropertieschange: jest.fn()
    };
}

function makeController(): ExportController {
    const controller = new ExportController("test-grid", makeMockProgress());
    controller.emit("sourcechange", list(5));
    controller.emit("propertieschange", [column("Col1"), column("Col2")]);
    controller.emit("columnschange", [0, 1]);
    return controller;
}

describe("ExportController export callbacks", () => {
    beforeEach(() => {
        MockDSExportRequest.mockImplementation(() => makeMockRequest() as DSExportRequest);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("calls onBeforeExport once before send() is called", async () => {
        const callOrder: string[] = [];

        MockDSExportRequest.mockImplementationOnce(() => {
            const req = makeMockRequest() as DSExportRequest;
            (req.send as jest.Mock).mockImplementation(() => {
                callOrder.push("send");
                return Promise.resolve();
            });
            return req;
        });

        const controller = makeController();
        controller.setOnBeforeExport(() => callOrder.push("onBefore"));

        await controller.exportData(jest.fn());

        expect(callOrder).toEqual(["onBefore", "send"]);
    });

    it("calls onAfterExport once after send() resolves with status 'success'", async () => {
        const controller = makeController();
        const onAfter = jest.fn();
        controller.setOnAfterExport(onAfter);

        await controller.exportData(jest.fn());

        expect(onAfter).toHaveBeenCalledTimes(1);
        expect(onAfter).toHaveBeenCalledWith(expect.objectContaining({ status: "success" }));
    });

    it("calls onAfterExport with status 'aborted' when request ends with aborted status", async () => {
        MockDSExportRequest.mockImplementationOnce(
            () => makeMockRequest({ status: "aborted", loaded: 5 }) as DSExportRequest
        );

        const controller = makeController();
        const onAfter = jest.fn();
        controller.setOnAfterExport(onAfter);

        await controller.exportData(jest.fn());

        expect(onAfter).toHaveBeenCalledTimes(1);
        expect(onAfter).toHaveBeenCalledWith(expect.objectContaining({ status: "aborted", exportedItemCount: 5 }));
    });

    it("passes the same startTime object to both onBeforeExport and onAfterExport", async () => {
        const controller = makeController();

        let capturedStartTime: Date | undefined;
        controller.setOnBeforeExport(args => {
            capturedStartTime = args.startTime;
        });
        const onAfter = jest.fn();
        controller.setOnAfterExport(onAfter);

        await controller.exportData(jest.fn());

        expect(capturedStartTime).toBeInstanceOf(Date);
        expect(onAfter.mock.calls[0][0].startTime).toBe(capturedStartTime);
    });

    it("completes exportData without errors when no callbacks are set", async () => {
        const controller = makeController();
        await expect(controller.exportData(jest.fn())).resolves.toBeUndefined();
    });
});
