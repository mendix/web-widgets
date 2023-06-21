import { renderHook, act } from "@testing-library/react";
import { useSelectState } from "../select";

describe("select", () => {
    describe("useSelectState", () => {
        const o = (c: string, v: string): { caption: string; value: string } => ({ caption: c, value: v });

        it("accept props and return new, empty state", () => {
            const {
                result: {
                    current: [state]
                }
            } = renderHook(() => useSelectState([], []));

            expect(state.inputValue).toBe("");
            expect(state.selected).toStrictEqual([]);
        });

        it("compute initial state from given props", () => {
            const o1 = o("Apple", "value1");
            const o2 = o("Banana", "value2");

            const {
                result: {
                    current: [state]
                }
            } = renderHook(() => useSelectState([o1, o2], [o2.value]));

            expect(state.inputValue).toBe("Banana");
            expect(state.selected).toStrictEqual([o2.value]);
        });

        it("compute initial state for multiple values", () => {
            const o1 = o("Apple", "value1");
            const o2 = o("Banana", "value2");
            const o3 = o("Mango", "value3");

            const {
                result: {
                    current: [state]
                }
            } = renderHook(() => useSelectState([o1, o2, o3], [o1.value, o3.value]));

            expect(state.inputValue).toBe("Apple,Mango");
            expect(state.selected).toStrictEqual([o1.value, o3.value]);
        });

        it("can override selected state using setSelected action", () => {
            const { result } = renderHook(() => useSelectState([o("A", "1"), o("B", "2")], ["1", "2"]));

            expect(result.current[0].selected).toStrictEqual(["1", "2"]);

            act(() => {
                const [, { setSelected }] = result.current;
                setSelected([]);
            });

            expect(result.current[0].selected).toStrictEqual([]);

            act(() => {
                const [, { setSelected }] = result.current;
                setSelected(["2"]);
            });

            expect(result.current[0].selected).toStrictEqual(["2"]);
        });

        it("can reset selected", () => {
            const { result } = renderHook(() => useSelectState([o("A", "1"), o("B", "2")], ["1"]));

            expect(result.current[0].selected).toStrictEqual(["1"]);

            act(() => {
                const [, { setSelected }] = result.current;
                setSelected(["foo"]);
            });

            expect(result.current[0].selected).toStrictEqual(["foo"]);
        });

        it("can reset selected with multiple values", () => {
            const { result } = renderHook(() => useSelectState([o("A", "1"), o("B", "2"), o("C", "3")], ["3"]));

            expect(result.current[0].selected).toStrictEqual(["3"]);

            act(() => {
                const [, { setSelected }] = result.current;
                setSelected(["1", "2", "3"]);
            });

            expect(result.current[0].selected).toStrictEqual(["1", "2", "3"]);

            act(() => {
                const [, { setSelected }] = result.current;
                setSelected(["1", "3"]);
            });

            expect(result.current[0].selected).toStrictEqual(["1", "3"]);
        });

        it("compute inputValue based on selected values", () => {
            const { result } = renderHook(() => useSelectState([o("A", "1"), o("B", "2"), o("C", "3")], ["1"]));

            expect(result.current[0].selected).toStrictEqual(["1"]);
            expect(result.current[0].inputValue).toBe("A");

            act(() => {
                const [, { setSelected }] = result.current;
                setSelected([]);
            });

            expect(result.current[0].inputValue).toBe("");

            act(() => {
                const [, { setSelected }] = result.current;
                setSelected(["2"]);
            });

            expect(result.current[0].inputValue).toBe("B");

            act(() => {
                const [, { setSelected }] = result.current;
                setSelected(["1", "2", "3"]);
            });

            expect(result.current[0].inputValue).toBe("A,B,C");
        });

        it("the toggle action remove value, if it was selected", () => {
            const { result } = renderHook(() => useSelectState([o("A", "1"), o("B", "2"), o("C", "3")], ["1"]));

            act(() => {
                const [, { toggle }] = result.current;
                toggle("1");
            });

            expect(result.current[0].selected).toStrictEqual([]);
        });

        it("the toggle action add value if it not yet selected", () => {
            const { result } = renderHook(() => useSelectState([o("A", "1"), o("B", "2"), o("C", "3")], []));

            act(() => {
                const [, { toggle }] = result.current;
                toggle("3");
            });

            expect(result.current[0].selected).toStrictEqual(["3"]);
        });

        it("the toggle action keep other selected values", () => {
            const { result } = renderHook(() => useSelectState([o("A", "1"), o("B", "2"), o("C", "3")], ["1", "2"]));

            act(() => {
                const [, { toggle }] = result.current;
                toggle("3");
            });

            expect(result.current[0].selected).toStrictEqual(["1", "2", "3"]);

            act(() => {
                const [, { toggle }] = result.current;
                toggle("1");
                toggle("2");
                toggle("3");
            });

            expect(result.current[0].selected).toStrictEqual([]);

            act(() => {
                const [, { toggle }] = result.current;
                toggle("1");
                toggle("2");
                toggle("3");
                toggle("3");
            });

            expect(result.current[0].selected).toStrictEqual(["1", "2"]);
        });
    });
});
