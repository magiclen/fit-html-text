import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { MAX_SEARCH_SIZE, findLargestFitSize } from "../src/search.ts";

describe("findLargestFitSize", () => {
    it("returns the largest size that fits", () => {
        const size = findLargestFitSize((fontSize) => fontSize * 10 <= 300, 8, 100);

        assert.equal(size, 30);
    });

    it("returns the minimum size when no larger size fits", () => {
        const size = findLargestFitSize(() => false, 8, 100);

        assert.equal(size, 8);
    });

    it("returns the maximum size when every size fits", () => {
        const size = findLargestFitSize(() => true, 8, 100);

        assert.equal(size, 100);
    });

    it("stops at the search limit when there is no maximum size", () => {
        const size = findLargestFitSize(() => true, 8, Infinity);

        assert.equal(size, MAX_SEARCH_SIZE);
    });
});
