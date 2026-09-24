/**
 * content/reviews.ts: every band excerpt is word for word from its review.
 *   npm test
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { excerptCore, reviews } from "../content/reviews";

describe("review excerpts", () => {
  for (const r of reviews)
    it(`${r.id}: excerpt appears exactly in the review`, () => {
      const core = excerptCore(r.excerpt);
      assert.ok(core.length > 0);
      assert.ok(r.body.includes(core), `"${core}" is not in ${r.id}'s review`);
    });
  it("strips a leading and trailing ellipsis only", () => {
    assert.equal(excerptCore("…easily added 10-15…"), "easily added 10-15");
    assert.equal(excerptCore("Plain sentence."), "Plain sentence.");
  });
  it("a reworded excerpt would fail", () => {
    const blake = reviews.find((r) => r.id === "blake-cook")!;
    assert.equal(blake.body.includes(excerptCore("…the most versatile mobility equipment…")), false);
  });
  it("featured band: Blake Cook (focal), Ashley Workman, J. Jones, B. Castillo, D. Muhammad; J. White out", () => {
    assert.deepEqual(reviews.filter((r) => r.featured).map((r) => r.author), ["Blake Cook", "Ashley Workman", "J. Jones", "B. Castillo", "D. Muhammad"]);
    assert.equal(reviews.find((r) => r.focal)?.author, "Blake Cook");
    assert.equal(reviews.find((r) => r.id === "j-white")?.featured, false);
  });
});
