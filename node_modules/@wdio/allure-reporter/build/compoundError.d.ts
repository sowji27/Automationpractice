export default class CompoundError extends Error {
    innerErrors: Error[];
    constructor(...innerErrors: Error[]);
}
//# sourceMappingURL=compoundError.d.ts.map