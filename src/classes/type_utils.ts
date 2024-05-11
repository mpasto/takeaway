const throwIfUndefined: <T, >(x: T | undefined) => asserts x is T = x => {
    if (typeof x === "undefined") throw new Error("Variable is undefined");
}
export { throwIfUndefined };