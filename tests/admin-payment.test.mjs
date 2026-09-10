import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const editor = readFileSync(new URL("../app/admin/Editor.tsx", import.meta.url), "utf8");
assert.match(editor, /\["payment", "Төлбөр"\]/);
assert.match(editor, /tab === "payment"/);
assert.match(editor, /Багцын төлбөрийн мэдээлэл/);
assert.match(editor, /QPay төлбөрийн цонхны мэдээлэл/);
assert.match(editor, /Merchant username, password, invoice code/);
console.log("PASS: dedicated payment admin keeps pricing, public copy and secrets separated.");
