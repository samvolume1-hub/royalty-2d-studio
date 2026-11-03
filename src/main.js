
/* ROYALTY 2D STUDIO
   Generate / Upload → Review → Approve → Rig Preparation → Download
*/

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const app = $('#app');
if (!app) throw new Error('Could not find the app container.');

const state = {
  imageUrl: null,
  imageBlob: null,
  imageName: '',
  imageSource: '',
  approved: false,
  checklist: [false, false, false, false, false],
  mimeType: 'image/png'
};

const styleDescriptions = {
  '2d': 'Professional 2D animated cartoon illustration, clean outlines, polished shapes and carefully controlled colours.',
  '3d': 'Polished stylized 3D animated character, dimensional forms and professional lighting.',
  auto: 'Professional animated character design following the requested visual style.'
};

app.innerHTML = `
<style>
:root {
  color-scheme: dark;
  --bg:#10131b; --panel:#191f2b; --line:#303b4d;
  --text:#f3f5fa; --muted:#aab4c5;
  --green:#73e0a0; --green2:#b0f4c8;
}
* { box-sizing:border-box; }
body {
  margin:0;
  background:radial-gradient(ellipse at 15% 0%,#20332d 0,transparent 36%),var(--bg);
  color:var(--text);
  font:15px/1.55 Inter,Segoe UI,Arial,sans-serif;
}
button,textarea,select,input { font:inherit; }
button {
  cursor:pointer; border:0; border-radius:11px;
  padding:12px 17px; font-weight:700;
}
button:disabled { opacity:.45; cursor:not-allowed; }
.primary { background:var(--green); color:#102018; }
.secondary { background:#2b3546; color:var(--text); border:1px solid #46536a; }
.danger { background:#442c35; color:#ffd5dc; border:1px solid #704453; }
.studio { max-width:1180px; margin:auto; padding:28px 20px 60px; }
.top { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:28px; }
.brand { display:flex; align-items:center; gap:13px; }
.brandmark {
  width:46px;height:46px;border-radius:14px;
  background:linear-gradient(135deg,#b9f5cb,#4cbf85);
  color:#102018;display:grid;place-items:center;font-size:25px;font-weight:900;
}
.brand h1 { font-size:19px;letter-spacing:1.2px;margin:0; }
.brand p { margin:2px 0 0;color:var(--muted);font-size:11px;letter-spacing:1.5px; }
.status-pill { border:1px solid #3b6c53;color:var(--green2);border-radius:30px;padding:7px 12px;font-size:12px; }
.hero { margin-bottom:22px; }
.eyebrow { color:var(--green);font-size:11px;font-weight:800;letter-spacing:1.8px; }
.hero h2 { font-size:clamp(27px,4vw,40px);line-height:1.15;margin:9px 0; }
.hero p { color:var(--muted);max-width:780px;margin:0; }
.card {
  background:linear-gradient(145deg,rgba(31,39,53,.98),rgba(22,28,39,.98));
  border:1px solid var(--line);border-radius:18px;
  padding:22px;margin:18px 0;box-shadow:0 14px 40px #0002;
}
.step-head { display:flex;align-items:center;gap:12px;margin-bottom:18px; }
.step-no {
  width:34px;height:34px;border-radius:10px;background:#294b3a;
  color:var(--green2);display:grid;place-items:center;font-weight:900;
}
.step-head h3 { margin:0;font-size:19px; }
.step-head p { margin:2px 0 0;color:var(--muted);font-size:13px; }
label { display:block;font-weight:700;font-size:13px;margin:12px 0 7px; }
textarea,select,input[type="text"] {
  width:100%;background:#111722;color:var(--text);
  border:1px solid #3b4659;border-radius:11px;padding:12px;outline:none;
}
textarea { min-height:105px;resize:vertical; }
textarea:focus,select:focus { border-color:var(--green); }
.controls { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px; }
.actions { display:flex;align-items:center;gap:13px;flex-wrap:wrap;margin-top:16px; }
.hint,.muted { color:var(--muted);font-size:13px; }
.message { color:var(--green2);font-size:13px;min-height:20px; }
.tabs { display:flex;gap:9px;flex-wrap:wrap;margin-bottom:15px; }
.tab { background:#202b3a;color:#dce5f1;border:1px solid #435168; }
.tab.active { background:var(--green);color:#102018;border-color:var(--green); }
.upload-box {
  border:1px dashed #60718a;border-radius:14px;padding:22px;
  background:#121a25;text-align:center;
}
.upload-box input { max-width:100%;margin:12px auto; }
.preview-grid { display:grid;grid-template-columns:minmax(0,1.3fr) minmax(240px,.7fr);gap:20px;align-items:start; }
.preview-frame {
  background:#0c1119;border:1px solid var(--line);border-radius:13px;
  min-height:260px;display:grid;place-items:center;overflow:hidden;padding:10px;
}
.preview-frame img { display:block;max-width:100%;max-height:620px;object-fit:contain; }
.empty { color:#8390a3;text-align:center;padding:35px 15px; }
.results { display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:15px;margin-top:18px; }
.result-card { background:#111722;border:1px solid var(--line);border-radius:14px;padding:12px; }
.result-card img { width:100%;height:230px;object-fit:contain;background:#0c1119;border-radius:9px; }
.checklist { display:grid;gap:10px; }
.check {
  display:flex;align-items:flex-start;gap:10px;background:#121a25;
  border:1px solid #303b4d;padding:11px;border-radius:10px;font-size:13px;
}
.check input { margin-top:4px;accent-color:var(--green); }
.note {
  border-left:3px solid var(--green);background:#17251f;padding:12px 14px;
  border-radius:0 10px 10px 0;color:#d5f4e0;font-size:13px;margin-top:14px;
}
.locked { opacity:.55; }
.locked-overlay { background:#121a25;border:1px dashed #526078;padding:18px;border-radius:12px;color:var(--muted); }
.hidden { display:none !important; }
footer { text-align:center;color:#7f8b9e;font-size:12px;margin-top:28px; }
@media(max-width:720px) {
  .controls,.preview-grid { grid-template-columns:1fr; }
  .top { align-items:flex-start;flex-direction:column; }
  .card { padding:16px; }
  .studio { padding:20px 13px 40px; }
}
</style>

<div class="studio">
  <header class="top">
    <div class="brand">
      <div class="brandmark">R</div>
      <div>
        <h1>ROYALTY 2D STUDIO</h1>
        <p>CHARACTER DESIGN & RIG PREPARATION</p>
      </div>
    </div>
    <span class="status-pill">Production workspace</span>
  </header>

  <section class="hero">
    <div class="eyebrow">CREATE · UPLOAD · REVIEW · PREPARE</div>
    <h2>Your character. Your creative control.</h2>
    <p>Generate a new character or upload your own artwork. Review and approve the character before opening the rig-preparation workspace.</p>
  </section>

  <section class="card" id="source-section">
    <div class="step-head">
      <span class="step-no">1</span>
      <div>
        <h3>Bring in your character</h3>
        <p>Choose AI generation or upload artwork you already own.</p>
      </div>
    </div>

    <div class="tabs">
      <button class="tab active" id="tab-generate" type="button">✦ Generate with AI</button>
      <button class="tab" id="tab-upload" type="button">↑ Upload my artwork</button>
    </div>

    <div id="generate-panel">
      <label for="character-prompt">Describe your character</label>
      <textarea id="character-prompt" maxlength="1000"
        placeholder="Example: A cheerful village storyteller wearing a blue jacket, brown trousers and oversized boots."></textarea>

      <div class="controls">
        <div>
          <label for="character-style">Art style</label>
          <select id="character-style">
            <option value="2d">Classic 2D cartoon</option>
            <option value="3d">Polished 3D cartoon</option>
            <option value="auto">Choose from my description</option>
          </select>
        </div>
        <div>
          <label for="character-count">Number of options</label>
          <select id="character-count">
            <option value="1" selected>1 option</option>
            <option value="2">2 options</option>
            <option value="3">3 options</option>
          </select>
        </div>
      </div>

      <p class="hint">The AI will create one full-body front A-pose at a time. We will not ask it to draw two different views in one image.</p>
      <div class="actions">
        <button class="primary" id="generate-button" type="button">✦ Generate front view</button>
        <span class="message" id="generate-status" role="status" aria-live="polite">Ready when you are.</span>
      </div>
      <div class="results" id="generated-results" hidden></div>
    </div>

    <div id="upload-panel" class="hidden">
      <div class="upload-box">
        <strong>Upload your existing character artwork</strong>
        <p class="hint">Choose a PNG, JPG, JPEG or WebP image from your computer.</p>
        <input id="character-file" type="file" accept="image/png,image/jpeg,image/webp">
        <p class="hint">Tip: A full-body character on a transparent or plain background is easiest to inspect.</p>
        <div class="message" id="upload-status" role="status" aria-live="polite"></div>
      </div>
    </div>
  </section>

  <section class="card" id="review-section">
    <div class="step-head">
      <span class="step-no">2</span>
      <div>
        <h3>Review your character</h3>
        <p>Inspect the artwork before approving it for preparation.</p>
      </div>
    </div>

    <div class="preview-grid">
      <div>
        <div class="preview-frame">
          <img id="selected-preview" alt="Character awaiting review" hidden>
          <div class="empty" id="preview-empty">Generate or upload a character to see it here.</div>
        </div>
        <p class="hint" id="character-filename">No character selected.</p>
      </div>
      <div>
        <p class="muted">Review the character carefully:</p>
        <div class="checklist">
          <label class="check"><input type="checkbox" id="review-appearance"> The character's appearance is correct.</label>
          <label class="check"><input type="checkbox" id="review-anatomy"> The visible anatomy and body parts are correct.</label>
          <label class="check"><input type="checkbox" id="review-clothing"> Clothing, colours and accessories are correct.</label>
          <label class="check"><input type="checkbox" id="review-framing"> The complete character is visible and not cropped.</label>
        </div>
        <div class="actions">
          <button class="primary" id="approve-button" type="button" disabled>✓ Approve this character</button>
          <button class="secondary" id="replace-button" type="button" disabled>Choose another</button>
        </div>
        <div class="message" id="review-status" role="status" aria-live="polite">Approval is required before rig preparation.</div>
      </div>
    </div>
  </section>

  <section class="card locked" id="rig-section">
    <div class="step-head">
      <span class="step-no">3</span>
      <div>
        <h3>Rig / prepare for animation</h3>
        <p>Preparation workspace — available after character approval.</p>
      </div>
    </div>

    <div id="rig-locked" class="locked-overlay">
      <strong>Workspace locked.</strong>
      <p>First select, review and approve a character above. Your artwork will remain unchanged until you approve it.</p>
    </div>

    <div id="rig-workspace" class="hidden">
      <p class="hint">Use this preparation checklist to plan the character's layers and joints.</p>
      <div class="checklist">
        <label class="check"><input type="checkbox" data-task="0"> Identify the torso, head and neck layers.</label>
        <label class="check"><input type="checkbox" data-task="1"> Separate the arms, hands, legs and feet where applicable.</label>
        <label class="check"><input type="checkbox" data-task="2"> Separate anatomy-specific parts such as wings, tails, paws, ears or accessories where applicable.</label>
        <label class="check"><input type="checkbox" data-task="3"> Reconstruct hidden artwork behind shoulders, elbows, hips and knees.</label>
        <label class="check"><input type="checkbox" data-task="4"> Mark joint pivots and test separated layers in the target animation app.</label>
      </div>

      <div class="note">
        <strong>Rigging reality check:</strong> Approval unlocks this preparation workspace. This version does not automatically split a flattened image into transparent body-part layers or create a native bone rig. Those capabilities must be implemented and tested separately.
      </div>

      <div class="actions">
        <button class="primary" id="download-image" type="button">↓ Download approved character</button>
        <button class="secondary" id="download-guide" type="button">↓ Download preparation notes</button>
      </div>
      <div class="message" id="download-status" role="status" aria-live="polite"></div>
    </div>
  </section>

  <section class="card">
    <div class="step-head">
      <span class="step-no">4</span>
      <div>
        <h3>Animation software</h3>
        <p>Prepare your artwork for your chosen application.</p>
      </div>
    </div>
    <div class="controls">
      <div>
        <label for="target-app">Target application</label>
        <select id="target-app">
          <option value="Moho 14">Moho 14</option>
          <option value="Cartoon Animator 5">Cartoon Animator 5</option>
        </select>
      </div>
      <div>
        <label>Export status</label>
        <p class="hint">Artwork and preparation notes only. Native rig project export is not yet implemented.</p>
      </div>
    </div>
  </section>

  <footer>ROYALTY 2D STUDIO · Your character, your control.</footer>
</div>
`;

const promptEl = $('#character-prompt');
const statusEl = $('#generate-status');
const resultsEl = $('#generated-results');
const generateButton = $('#generate-button');
const previewEl = $('#selected-preview');
const previewEmpty = $('#preview-empty');
const approveButton = $('#approve-button');
const replaceButton = $('#replace-button');
const rigSection = $('#rig-section');

function setTab(tab) {
  const generating = tab === 'generate';
  $('#generate-panel').classList.toggle('hidden', !generating);
  $('#upload-panel').classList.toggle('hidden', generating);
  $('#tab-generate').classList.toggle('active', generating);
  $('#tab-upload').classList.toggle('active', !generating);
}

function clearReviewChecks() {
  ['#review-appearance','#review-anatomy','#review-clothing','#review-framing']
    .forEach(selector => { $(selector).checked = false; });
}

function revokeCurrentUrl() {
  if (state.imageUrl && state.imageUrl.startsWith('blob:')) {
    URL.revokeObjectURL(state.imageUrl);
  }
}

function resetApproval() {
  state.approved = false;
  clearReviewChecks();
  $('#rig-locked').classList.remove('hidden');
  $('#rig-workspace').classList.add('hidden');
  rigSection.classList.add('locked');
  $('#review-status').textContent = 'Review all four items, then approve your character.';
  updateApprovalButton();
}

function setCharacter(blob, filename, source, mimeType) {
  revokeCurrentUrl();

  state.imageBlob = blob;
  state.imageUrl = URL.createObjectURL(blob);
  state.imageName = filename || 'royalty-character';
  state.imageSource = source;
  state.mimeType = mimeType || blob.type || 'image/png';

  previewEl.src = state.imageUrl;
  previewEl.hidden = false;
  previewEmpty.hidden = true;
  $('#character-filename').textContent = `${state.imageName} · ${source}`;

  resetApproval();
  approveButton.disabled = false;
  replaceButton.disabled = false;

  $('#review-status').textContent = 'Inspect your character and tick all four review items.';
  $('#review-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateApprovalButton() {
  const checks = [
    $('#review-appearance').checked,
    $('#review-anatomy').checked,
    $('#review-clothing').checked,
    $('#review-framing').checked
  ];
  approveButton.disabled = !state.imageBlob || !checks.every(Boolean) || state.approved;
}

function saveBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function safeFilename(name) {
  return (name || 'royalty-character')
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9_-]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70) || 'royalty-character';
}

function buildCharacterPrompt(brief, style) {
  const instruction =
    'Create ONE single full-body character illustration, FRONT VIEW ONLY. ' +
    'The character faces directly toward the viewer in a natural A-pose, with arms angled slightly downward from the shoulders, hands visible, legs naturally apart and both feet visible. ' +
    'Show the complete character from head to feet without cropping. ' +
    'Respect the exact species, identity, anatomy, number of limbs, clothing, colours, markings and accessories described. ' +
    'Do not add tails, wings, horns, extra limbs, extra feet or clothing that is not specified. ' +
    'Use a plain neutral studio background. ' +
    'Show only ONE character and ONE view. No side view, back view, extra characters, lettering, watermark, logo or border. ';

  const styleText = styleDescriptions[style] || styleDescriptions.auto;
  const finalPrompt = `${instruction} CHARACTER DESCRIPTION: ${brief}. ART STYLE: ${styleText}`;

  // Keep the request within the Worker input limit.
  return finalPrompt.slice(0, 1850);
}

async function generateCharacter() {
  const brief = promptEl.value.trim();

  if (!brief) {
    statusEl.textContent = 'Please describe your character first.';
    promptEl.focus();
    return;
  }

  generateButton.disabled = true;
  generateButton.textContent = 'Generating…';
  statusEl.textContent = 'Generating one front-view character. Please wait.';
  resultsEl.hidden = true;
  resultsEl.replaceChildren();

  try {
    const apiBase = (import.meta.env.VITE_AI_API_BASE_URL || '').replace(/\/+$/, '');
    if (!apiBase) {
      throw new Error('The AI API address is missing. Check VITE_AI_API_BASE_URL in Cloudflare Pages.');
    }

    const style = $('#character-style').value;
    const count = Math.min(3, Math.max(1, Number($('#character-count').value) || 1));
    const finalPrompt = buildCharacterPrompt(brief, style);

    const response = await fetch(`${apiBase}/api/character/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: finalPrompt, style, steps: 4, n: count })
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload || payload.success !== true) {
      throw new Error(payload?.error || `AI service returned HTTP ${response.status}.`);
    }

    const images = Array.isArray(payload.images)
      ? payload.images
      : payload.imageBase64 ? [payload.imageBase64] : [];

    if (!images.length) throw new Error('The AI service returned no image data.');

    resultsEl.replaceChildren();

    images.forEach((base64, index) => {
      const card = document.createElement('article');
      card.className = 'result-card';

      const image = document.createElement('img');
      image.alt = `Generated front-view character option ${index + 1}`;
      image.src = `data:${payload.mimeType || 'image/jpeg'};base64,${base64}`;

      const choose = document.createElement('button');
      choose.className = 'primary';
      choose.type = 'button';
      choose.textContent = 'Review this character';

      choose.addEventListener('click', () => {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const mime = payload.mimeType || 'image/jpeg';
        const blob = new Blob([bytes], { type: mime });
        setCharacter(blob, `royalty-generated-character-${index + 1}`, 'AI generated', mime);
      });

      card.append(image, choose);
      resultsEl.append(card);
    });

    resultsEl.hidden = false;
    statusEl.textContent = `${images.length} front-view option${images.length === 1 ? '' : 's'} received. Choose one to review and approve.`;
    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  } catch (error) {
    console.error('Royalty 2D Studio generation error:', error);
    statusEl.textContent = error?.message || 'Generation failed. Check the Worker logs.';
  } finally {
    generateButton.disabled = false;
    generateButton.textContent = '✦ Generate front view';
  }
}

async function uploadCharacter(file) {
  if (!file) return;

  const allowed = ['image/png', 'image/jpeg', 'image/webp'];
  if (!allowed.includes(file.type)) {
    $('#upload-status').textContent = 'Please choose a PNG, JPG, JPEG or WebP image.';
    $('#character-file').value = '';
    return;
  }

  if (file.size > 15 * 1024 * 1024) {
    $('#upload-status').textContent = 'This image is larger than 15 MB. Please choose a smaller file.';
    $('#character-file').value = '';
    return;
  }

  try {
    const image = new Image();
    const temporaryUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(temporaryUrl);

      if (!image.naturalWidth || !image.naturalHeight) {
        $('#upload-status').textContent = 'This image could not be read. Please try another file.';
        return;
      }

      setCharacter(file, file.name, 'Your uploaded artwork', file.type);
      $('#upload-status').textContent = 'Upload successful. Your artwork is ready for review.';
    };

    image.onerror = () => {
      URL.revokeObjectURL(temporaryUrl);
      $('#upload-status').textContent = 'The image could not be opened. Please try another file.';
    };

    image.src = temporaryUrl;
  } catch (error) {
    $('#upload-status').textContent = error?.message || 'Upload failed.';
  }
}

function approveCharacter() {
  if (!state.imageBlob) return;

  const checks = [
    $('#review-appearance').checked,
    $('#review-anatomy').checked,
    $('#review-clothing').checked,
    $('#review-framing').checked
  ];

  if (!checks.every(Boolean)) {
    $('#review-status').textContent = 'Please complete all four review checks first.';
    return;
  }

  state.approved = true;
  $('#rig-locked').classList.add('hidden');
  $('#rig-workspace').classList.remove('hidden');
  rigSection.classList.remove('locked');
  $('#review-status').textContent = 'Character approved. Rig-preparation workspace unlocked.';
  approveButton.disabled = true;
  rigSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function downloadApprovedCharacter() {
  if (!state.approved || !state.imageBlob) return;

  const extension = state.mimeType === 'image/png'
    ? 'png'
    : state.mimeType === 'image/webp' ? 'webp' : 'jpg';

  saveBlob(
    `${safeFilename(state.imageName)}-approved.${extension}`,
    state.imageBlob
  );

  $('#download-status').textContent = 'Approved character download started.';
}

function downloadPreparationGuide() {
  if (!state.approved) return;

  const target = $('#target-app').value;
  const tasks = [
    'Identify the torso, head and neck layers.',
    'Separate the arms, hands, legs and feet where applicable.',
    'Separate anatomy-specific parts such as wings, tails, paws, ears or accessories.',
    'Reconstruct hidden artwork behind shoulders, elbows, hips and knees.',
    'Mark joint pivots and test separated layers in the target animation app.'
  ];

  const guide = `ROYALTY 2D STUDIO
CHARACTER PREPARATION NOTES

CHARACTER: ${state.imageName}
SOURCE: ${state.imageSource}
TARGET APPLICATION: ${target}

IMPORTANT
This approved image is the master reference artwork.
Approval does not automatically turn a flattened image into
separate transparent body-part layers or a native bone rig.

PREPARATION WORKFLOW

1. Open the approved image in an art editor that supports layers.

2. Separate the character into movable transparent layers.
Adapt the parts to the character's actual anatomy.

3. Reconstruct hidden artwork behind joints so that gaps do
not appear when body parts rotate or bend.

4. Keep the original canvas dimensions and alignment consistent
across all separated layers.

5. Mark appropriate pivot locations for the character's joints.

6. Import the separated layers into ${target}.

7. Build and test the native bone rig inside that application.

8. Test extreme poses and repair gaps, stretching or intersections.

PREPARATION CHECKLIST
${tasks.map((task, i) => `[${state.checklist[i] ? 'x' : ' '}] ${task}`).join('\n')}

STATUS
Character approved for preparation.
Native rig creation and native project export are not performed
by this version of Royalty 2D Studio.

ROYALTY 2D STUDIO
`;

  saveBlob(
    `${safeFilename(state.imageName)}-rig-preparation.txt`,
    new Blob([guide], { type: 'text/plain;charset=utf-8' })
  );

  $('#download-status').textContent = 'Preparation notes download started.';
}

$('#tab-generate').addEventListener('click', () => setTab('generate'));
$('#tab-upload').addEventListener('click', () => setTab('upload'));
generateButton.addEventListener('click', generateCharacter);
$('#character-file').addEventListener('change', event => uploadCharacter(event.target.files?.[0]));

[
  '#review-appearance',
  '#review-anatomy',
  '#review-clothing',
  '#review-framing'
].forEach(selector => {
  $(selector).addEventListener('change', updateApprovalButton);
});

approveButton.addEventListener('click', approveCharacter);

replaceButton.addEventListener('click', () => {
  revokeCurrentUrl();
  state.imageUrl = null;
  state.imageBlob = null;
  state.imageName = '';
  state.approved = false;
  previewEl.removeAttribute('src');
  previewEl.hidden = true;
  previewEmpty.hidden = false;
  $('#character-filename').textContent = 'No character selected.';
  approveButton.disabled = true;
  replaceButton.disabled = true;
  resetApproval();
  $('#review-status').textContent = 'Choose or generate another character.';
});

$$('[data-task]').forEach(input => {
  input.addEventListener('change', () => {
    const index = Number(input.dataset.task);
    state.checklist[index] = input.checked;
  });
});

$('#download-image').addEventListener('click', downloadApprovedCharacter);
$('#download-guide').addEventListener('click', downloadPreparationGuide);
