import { DatasourceUpdateProcessor, DatasourceUpdateProcessorCallbacks } from "../DatasourceUpdateProcessor";
import { ListValueBuilder, obj } from "@mendix/widget-plugin-test-utils";
import { ObjectItem } from "mendix";

const fileHasContentsMock = jest.fn();
jest.mock("../mx-data", () => ({
    fileHasContents: (...args: any[]) => fileHasContentsMock(...args)
}));

describe("DatasourceUpdateProcessor", () => {
    let dsUpdater: DatasourceUpdateProcessor;
    let callbacks: DatasourceUpdateProcessorCallbacks;
    beforeEach(() => {
        fileHasContentsMock.mockImplementation(() => true);
        callbacks = {
            loaded: jest.fn(),
            processExisting: jest.fn(),
            processNew: jest.fn(),
            processMissing: jest.fn()
        };

        dsUpdater = new DatasourceUpdateProcessor(callbacks);
    });
    describe("loaded callback", () => {
        describe("when updated with loading ds", () => {
            beforeEach(() => {
                dsUpdater.processUpdate(new ListValueBuilder().isLoading().build());
            });
        });
        test("'loaded' is not yet called", () => {
            expect(callbacks.loaded).not.toHaveBeenCalled();
        });

        describe("when called with loaded ds", () => {
            beforeEach(() => {
                dsUpdater.processUpdate(new ListValueBuilder().withItems([obj("A"), obj("B"), obj("C")]).build());
            });

            test("'loaded' is called", () => {
                expect(callbacks.loaded).toHaveBeenCalledTimes(1);
            });

            test("'processExisting' is called", () => {
                expect(callbacks.processExisting).toHaveBeenCalledTimes(3);
                expect((callbacks.processExisting as jest.Mock).mock.calls).toEqual([
                    [obj("A")],
                    [obj("B")],
                    [obj("C")]
                ]);
            });

            describe("when called with new empty, new non-empty object and missing object", () => {
                beforeEach(() => {
                    fileHasContentsMock.mockImplementation((obj: ObjectItem) => {
                        // Simulate that D is an empty object
                        return obj.id !== "obj_D";
                    });

                    (callbacks.processExisting as jest.Mock).mockClear();
                    (callbacks.processNew as jest.Mock).mockClear();
                    (callbacks.processMissing as jest.Mock).mockClear();
                    (callbacks.loaded as jest.Mock).mockClear();

                    dsUpdater.processUpdate(
                        new ListValueBuilder().withItems([obj("A"), obj("C"), obj("D"), obj("E")]).build()
                    );
                });

                test("'loaded' is not called again", () => {
                    expect(callbacks.loaded).not.toHaveBeenCalled();
                });

                test("'processMissing' is not called", () => {
                    expect(callbacks.processMissing).toHaveBeenCalledTimes(1);
                    expect(callbacks.processMissing).toHaveBeenCalledWith(obj("B"));
                });

                test("'processExisting' is not called", () => {
                    expect(callbacks.processMissing).toHaveBeenCalledTimes(1);
                    expect(callbacks.processExisting).toHaveBeenCalledWith(obj("E"));
                });

                test("'processNew' is called", () => {
                    expect(callbacks.processMissing).toHaveBeenCalledTimes(1);
                    expect(callbacks.processNew).toHaveBeenCalledWith(obj("D"));
                });
            });
        });
    });
});
