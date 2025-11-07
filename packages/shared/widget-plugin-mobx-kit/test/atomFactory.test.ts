import { configure, observable, runInAction } from "mobx";
import { atomFactory } from "../src/lib/atomFactory";
import { ComputedAtom } from "../src/main";

describe("atomFactory", () => {
    configure({
        enforceActions: "never"
    });

    it("should create a computed atom factory that composes map and computation functions", () => {
        const map = (x: number, y: number) => [x + 1, y + 1] as const;
        const fn = (a: number, b: number): number => a * b;
        const factory = atomFactory(map, fn);

        const atom = factory(2, 3);
        expect(atom.get()).toBe(12); // (2+1) * (3+1) = 3 * 4 = 12
    });

    it("should return a function that creates computed atoms", () => {
        const map = (x: number) => [x * 2] as const;
        const fn = (a: number): number => a + 10;
        const factory = atomFactory(map, fn);

        const atom1 = factory(5);
        const atom2 = factory(3);

        expect(atom1.get()).toBe(20); // (5*2) + 10 = 20
        expect(atom2.get()).toBe(16); // (3*2) + 10 = 16
    });

    it("should create reactive computed atoms that update when observables change", () => {
        const observableValue = observable.box(5);
        const map = (x: number) => [x, observableValue.get()] as const;
        const fn = (a: number, b: number): number => a + b;
        const factory = atomFactory(map, fn);

        const atom = factory(10);
        expect(atom.get()).toBe(15); // 10 + 5 = 15

        observableValue.set(20);
        expect(atom.get()).toBe(30); // 10 + 20 = 30
    });

    it("should handle multiple parameters in map function", () => {
        const map = (a: number, b: number, c: number) => [a + b, c] as const;
        const fn = (x: number, y: number): number => x * y;
        const factory = atomFactory(map, fn);

        const atom = factory(2, 3, 4);
        expect(atom.get()).toBe(20); // (2+3) * 4 = 5 * 4 = 20
    });

    it("should handle complex objects and transformations", () => {
        interface Input {
            value: number;
        }
        interface Output {
            doubled: number;
        }

        const map = (input: Input) => [input.value] as const;
        const fn = (value: number): Output => ({ doubled: value * 2 });
        const factory = atomFactory(map, fn);

        const atom = factory({ value: 7 });
        expect(atom.get()).toEqual({ doubled: 14 });
    });

    it("should cache computed values and only recompute when dependencies change", () => {
        const box = observable.box(1);
        const mapFn = jest.fn((x: ComputedAtom<number>) => [x.get()] as const);
        const computeFn = jest.fn((a: number): number => a * 6);
        const factory = atomFactory(mapFn, computeFn);

        const atom = factory(box);

        runInAction(() => {
            // First access
            expect(atom.get()).toBe(6);
            expect(mapFn).toHaveBeenCalledTimes(1);
            expect(computeFn).toHaveBeenCalledTimes(1);

            expect(atom.get()).toBe(6);
            expect(mapFn).toHaveBeenCalledTimes(1);
            expect(computeFn).toHaveBeenCalledTimes(1);

            box.set(2);
            expect(atom.get()).toBe(12);
            expect(mapFn).toHaveBeenCalledTimes(2);
            expect(computeFn).toHaveBeenCalledTimes(2);
        });
    });

    it("should handle zero parameters", () => {
        const map = () => [42] as const;
        const fn = (x: number): number => x * 2;
        const factory = atomFactory(map, fn);

        const atom = factory();
        expect(atom.get()).toBe(84);
    });

    it("should handle string transformations", () => {
        const map = (str: string, prefix: string) => [prefix, str] as const;
        const fn = (prefix: string, str: string): string => `${prefix}${str}`;
        const factory = atomFactory(map, fn);

        const atom = factory("World", "Hello ");
        expect(atom.get()).toBe("Hello World");
    });

    it("should handle array transformations", () => {
        const map = (arr: number[]) => [arr] as const;
        const fn = (arr: number[]): number => arr.reduce((sum, n) => sum + n, 0);
        const factory = atomFactory(map, fn);

        const atom = factory([1, 2, 3, 4, 5]);
        expect(atom.get()).toBe(15);
    });

    it("should allow multiple atoms created from the same factory to be independent", () => {
        const map = (x: number) => [x] as const;
        const fn = (x: number): number => x * x;
        const factory = atomFactory(map, fn);

        const atom1 = factory(3);
        const atom2 = factory(4);

        expect(atom1.get()).toBe(9);
        expect(atom2.get()).toBe(16);
    });

    it("should work with observables in the computation function", () => {
        const observableValue = observable.box(10);
        const map = (multiplier: number) => [multiplier] as const;
        const fn = (multiplier: number): number => observableValue.get() * multiplier;
        const factory = atomFactory(map, fn);

        const atom = factory(2);
        expect(atom.get()).toBe(20);

        observableValue.set(15);
        expect(atom.get()).toBe(30);
    });

    it("should recompute when multiple boxed observable values change", () => {
        const box1 = observable.box(5);
        const box2 = observable.box(10);
        const box3 = observable.box(2);

        const map = <T extends ComputedAtom<number> = ComputedAtom<number>>(a: T, b: T, c: T) =>
            [a.get(), b.get(), c.get()] as const;
        const fn = (a: number, b: number, c: number): number => (a + b) * c;
        const factory = atomFactory(map, fn);

        const atom = factory(box1, box2, box3);

        // Initial computation: (5 + 10) * 2 = 30
        expect(atom.get()).toBe(30);

        // Change first box: (8 + 10) * 2 = 36
        box1.set(8);
        expect(atom.get()).toBe(36);

        // Change second box: (8 + 15) * 2 = 46
        box2.set(15);
        expect(atom.get()).toBe(46);

        // Change third box: (8 + 15) * 3 = 69
        box3.set(3);
        expect(atom.get()).toBe(69);

        // Change multiple boxes: (20 + 5) * 4 = 100
        box1.set(20);
        box2.set(5);
        box3.set(4);
        expect(atom.get()).toBe(100);
    });
});
