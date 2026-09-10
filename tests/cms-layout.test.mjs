import assert from "node:assert/strict";
import {
  blockAlignments,
  blockTones,
  blockView,
  blockWidths,
  moveActiveItem,
} from "../lib/cms-layout.ts";

const items = [
  { id: "one" },
  { id: "removed", deleted: true },
  { id: "two" },
  { id: "three" },
];
assert.deepEqual(
  moveActiveItem(items, "two", -1).map((item) => item.id),
  ["two", "removed", "one", "three"],
);
assert.deepEqual(
  moveActiveItem(items, "two", 1).map((item) => item.id),
  ["one", "removed", "three", "two"],
);
assert.equal(moveActiveItem(items, "one", -1), items);
assert.deepEqual(blockView({}), { width: "content", align: "left", tone: "default" });
assert.deepEqual(blockView({ width: "full", align: "center", tone: "accent" }), {
  width: "full",
  align: "center",
  tone: "accent",
});
assert.deepEqual(blockView({ width: "bad", align: "bad", tone: "bad" }), {
  width: "content",
  align: "left",
  tone: "default",
});
assert.deepEqual(blockWidths, ["narrow", "content", "full"]);
assert.deepEqual(blockAlignments, ["left", "center", "right"]);
assert.deepEqual(blockTones, ["default", "surface", "accent"]);
console.log("PASS: page/section ordering preserves removed items and block views are normalized.");
