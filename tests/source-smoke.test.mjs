import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const js = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');

test('all required character controls are present', () => {
  for (const value of ['front', 'side', 'back', 'top']) assert.match(js, new RegExp(`data-view="${value}"`));
  for (const value of ['happy', 'surprised', 'sad', 'silly', 'angry']) assert.match(js, new RegExp(`data-expression="${value}"`));
  for (const value of ['REST', 'AI', 'E', 'O', 'U', 'FV', 'MBP', 'L']) assert.match(js, new RegExp(`data-mouth="${value}"`));
  for (const value of ['open', 'fist', 'point', 'wave', 'pinch', 'thumb']) assert.match(js, new RegExp(`data-hand="${value}"`));
});

test('project import is versioned, size-limited, and validated', () => {
  assert.match(js, /format:'royalty2d-project',version:1/);
  assert.match(js, /file\.size>2_000_000/);
  assert.match(js, /function validateProject\(d\)/);
});

test('professional workflow controls are wired in source', () => {
  for (const id of ['undo', 'redo', 'zoom-in', 'zoom-out', 'zoom-fit', 'palette-options']) assert.ok(js.includes(`'${id}'`) || js.includes(`#${id}`) || js.includes(`id="${id}"`), `missing ${id}`);
  assert.match(js, /function undo\(/);
  assert.match(js, /function redo\(/);
  assert.match(js, /function svgStyles\(/);
  assert.match(css, /prefers-reduced-motion/);
});


test('recognizes a boy prompt and selects a distinct human character design', () => {
  assert.match(js, /\\b\(boy\|man\|male\|guy\|human\|person\|child\|kid\)\\b/);
  assert.match(js, /species==='boy'/);
  assert.match(js, /Boy character generated from your description/);
});

test('animation lab, audio lip sync, PNG and 3D controls are present', async () => {
  const source = js;
  for (const id of ['motion-preset','play-motion','add-keyframe','export-keyframes','preview-3d','lip-audio-file','mic-lipsync','export-png']) {
    assert.ok(source.includes(`id="${id}"`), `missing ${id}`);
  }
  assert.match(source, /createMediaElementSource/);
  assert.match(source, /getUserMedia/);
  assert.match(source, /image\/png/);
});


test('animation lab is reachable from the always-visible top navigation', () => {
  assert.match(js, /id="jump-animation"/);
  assert.match(js, /lab\.scrollIntoView\(\{behavior:'smooth',block:'start'\}\)/);
  assert.match(css, /\.animation-shortcut/);
});

 test('PNG import automatically creates a fitted starter rig and animation clips', async () => { const source = js; assert.match(source, /function autoRigFromPng/); assert.match(source, /function generateStarterAnimation/); assert.match(source, /Auto-rig PNG/); assert.match(source, /autoRigFromPng\(img\);generateStarterAnimation\(\)/); });

test('single PNG can generate a set of transparent rig-aligned body-part masks', () => {
  assert.match(js, /id="generate-body-parts"/);
  assert.match(js, /function bodyPartShapes\(/);
  assert.match(js, /function makeBodyPartCanvas\(/);
  assert.match(js, /function generateAllBodyParts\(/);
  const generator = js.slice(js.indexOf('function generateAllBodyParts('), js.indexOf("function downloadBodyPart"));
  assert.match(generator, /generateStarterAnimation\(\)/, 'Generate All Body Parts also creates starter animation clips');
  assert.match(generator, /drawRig\(\)/, 'Generate All Body Parts displays the fitted skeleton rig');
  assert.match(js, /left_upper_arm/);
  assert.match(js, /right_thigh/);
  assert.match(js, /download-all-parts/);
});


test('canvas zoom and pan controls move imported PNG, vector art, and rig together', () => {
  for (const id of ['zoom-in','zoom-out','zoom-fit','pan-toggle','zoom-level']) assert.ok(js.includes(`id="${id}"`), `missing ${id}`);
  assert.match(js, /function updateCanvasViewport\(/);
  assert.match(js, /stageEl\.addEventListener\('pointermove'/);
  assert.match(js, /stageEl\.addEventListener\('wheel'/);
  assert.match(css, /#imported-png-reference\{transform:translate/);
});


test('generated body parts can be downloaded together in a self-contained ZIP with rig metadata', () => {
  assert.ok(js.includes('Download body parts ZIP'));
  assert.ok(js.includes('function makeZip(files)'));
  assert.ok(js.includes('downloadGeneratedPartsZip'));
  assert.ok(js.includes("body_parts/${part.name}.png"));
  assert.ok(js.includes("name:'rig.json'"));
});


test('standalone app includes the body-part shape function used by Generate All Body Parts', () => {
  const standalone = readFileSync(new URL('../standalone.html', import.meta.url), 'utf8');
  assert.match(standalone, /function bodyPartShapes\(\)/);
  assert.match(standalone, /function generateAllBodyParts\(\)/);
  assert.match(standalone, /const shapes=bodyPartShapes\(\)/);
  assert.match(standalone, /Body-part generation failed:/);
  assert.match(standalone, /if\(generateAllBodyParts\(\)\)downloadGeneratedPartsZip\(\)/);
});


test('bodyPartShapes produces all 16 expected body-part masks from rig joints', async () => {
  const vm = await import('node:vm');
  const match = js.match(/function bodyPartShapes\(\)\{[\s\S]*?\n\}/);
  assert.ok(match, 'bodyPartShapes function should be defined');
  const rigPoints = {
    head:[200,72], neck:[200,125], chest:[200,158], pelvis:[200,235],
    lShoulder:[157,151], lElbow:[125,195], lWrist:[102,237],
    rShoulder:[243,151], rElbow:[275,195], rWrist:[298,237],
    lHip:[180,240], lKnee:[170,300], lAnkle:[162,354],
    rHip:[220,240], rKnee:[230,300], rAnkle:[238,354]
  };
  const context = { rigPoints, pngRigBounds:{x:100,y:20,width:200,height:340} };
  const fn = vm.runInNewContext(`${match[0]}; bodyPartShapes;`, context);
  const names = fn().map(([name]) => name);
  assert.equal(names.length, 16);
  for (const name of ['head','torso','pelvis','left_upper_arm','left_forearm','left_hand','right_upper_arm','right_forearm','right_hand','left_thigh','left_shin','left_foot','right_thigh','right_shin','right_foot']) assert.ok(names.includes(name), `missing ${name}`);
});

test('AI Character Forge exposes 2D and 3D modes and sends prompts to the secure backend', () => {
  for (const id of ['ai-character-prompt','ai-style','ai-framing','ai-background','ai-quality','ai-generate','ai-results']) assert.ok(js.includes(`id="${id}"`), `missing ${id}`);
  assert.match(js, /classic professional 2D cartoon illustration/);
  assert.match(js, /high-end stylized 3D animated feature-film character/);
  assert.match(js, /\/api\/character\/generate/);
  assert.match(js, /Use in Character Canvas/);
});

test('AI Worker keeps provider credentials server-side and validates prompt and origin', async () => {
  const worker = readFileSync(new URL('../worker/index.js', import.meta.url), 'utf8');
  assert.match(worker, /env\.AI/);
  assert.match(worker, /env\.AI\.run/);
  assert.match(worker, /@cf\/black-forest-labs\/flux-1-schnell/);
  assert.match(worker, /prompt\.length > MAX_PROMPT_LENGTH/);
  assert.match(worker, /access-control-allow-origin/);
  assert.doesNotMatch(js, /OPENAI_API_KEY/);
  assert.match(worker, /mimeType: "image\/jpeg"/);
});
