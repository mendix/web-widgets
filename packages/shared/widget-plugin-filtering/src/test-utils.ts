/* eslint-disable @typescript-eslint/explicit-function-return-type */
global.structuredClone = (val: unknown) => JSON.parse(JSON.stringify(val));

export function withRealDates(condition: any) {
    const clone = structuredClone(condition);

    function setRealDates(cond: any) {
        if (cond.name === "or" || cond.name === "and") {
            cond.args.forEach(setRealDates);
            return;
        }
        if (cond.type === "function") {
            setRealDates(cond.arg1);
            setRealDates(cond.arg2);
            return;
        }
        if (cond.type === "literal" && cond.valueType === "DateTime") {
            cond.value = new Date(cond.value);
        }
    }

    setRealDates(clone);

    return clone;
}
