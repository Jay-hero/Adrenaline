import assert from 'node:assert/strict';
import {normalizeDesign,defaultDesign,sections,designStyle} from '../lib/design.ts';
assert.deepEqual(normalizeDesign(),defaultDesign);
const d=normalizeDesign({order:['contact','contact','bad'],hidden:['tracker','bad'],accent:'url(javascript:1)',radius:200,spacing:-1,textSize:99});
assert.equal(d.order[0],'contact');assert.equal(d.order.length,sections.length);assert.equal(new Set(d.order).size,sections.length);assert.deepEqual(d.hidden,['tracker']);assert.equal(d.accent,defaultDesign.accent);assert.equal(d.radius,32);assert.equal(d.spacing,56);assert.equal(d.textSize,22);
const saved=JSON.parse(JSON.stringify(normalizeDesign({accent:'#00aa88',hidden:['membership'],order:[...defaultDesign.order].reverse(),stickyCta:false})));
assert.deepEqual(normalizeDesign(saved),saved);assert.equal(designStyle(saved)['--red'],'#00aa88');
console.log('PASS: defaults, ordering, hide/restore data, CSS validation, numeric limits and save/reload serialization.');
