import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { fitText } from "../src/index.ts";

describe("fitText", () => {
    it("is a function", () => {
        assert.equal(typeof fitText, "function");
    });
});
