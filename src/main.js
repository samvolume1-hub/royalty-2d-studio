
// ROYALTY 2D STUDIO — clean Generate → Rig/Prepare → Download workflow
// Uses the existing Cloudflare Worker endpoint and VITE_AI_API_BASE_URL setting.

const $ = (selector, root = document) => root.querySelector(selector);

const app = $('#app');
if (!app) throw new Error('Royalty 2D Studio could not find #app in index.html.');

const state = {
  prompt: '',
  style: '2d',
  quality: 'high',
  variations: 1,
  images: [],
  mimeType: 'image/jpeg',
  selectedIndex: 0,
  prepared: false
};

const styleText = {
  '2d': 'professional 2D cartoon illustration, clean confident outlines, appealing shapes, rich controlled colours',
  '3d': 'polished stylized 3D animated character, appealing sculpted forms and expressive materials',
  both: 'professional animation character design; use the visual style requested in the brief'
};

app.innerHTML = `
<style>
:root{color-scheme:dark;--bg:#10131b;--panel:#191f2b;--panel2:#202838;--line:#303b4d;--text:#f3f5fa;--muted:#aab4c5;--green:#73e0a0;--green2:#b0f4c8;--purple:#9b8cff}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(ellipse at 15% 0%,#20332d 0,transparent 36%),var(--bg);color:var(--text);font:15px/1.55 Inter,Segoe UI,Arial,sans-serif}
button,input,textarea,select{font:inherit}button{cursor:pointer;border:0;border-radius:11px;padding:12px 17px;font-weight:700}
button:disabled{opacity:.5;cursor:wait}.primary{background:var(--green);color:#102018}.secondary{background:#2b3546;color:var(--text);border:1px solid #46536a}
.studio{max-width:1180px;margin:auto;padding:28px 20px 60px}.top{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:28px}
.brand{display:flex;align-items:center;gap:13px}.brandmark{width:46px;height:46px;border-radius:14px;background:linear-gradient(135deg,#b9f5cb,#4cbf85);color:#102018;display:grid;place-items:center;font-size:25px;font-weight:900}
.brand h1{font-size:19px;letter-spacing:1.2px;margin:0}.brand p{margin:2px 0 0;color:var(--muted);font-size:11px;letter-spacing:1.5px}
.status-pill{border:1px solid #3b6c53;color:var(--green2);border-radius:30px;padding:7px 12px;font-size:12px}
.hero{margin-bottom:22px}.eyebrow{color:var(--green);font-size:11px;font-weight:800;letter-spacing:1.8px}.hero h2{font-size:clamp(27px,4vw,40px);line-height:1.15;margin:9px 0}.hero p{color:var(--muted);max-width:760px;margin:0}
.card{background:linear-gradient(145deg,rgba(31,39,53,.98),rgba(22,28,39,.98));border:1px solid var(--line);border-radius:18px;padding:22px;margin:18px 0;box-shadow:0 14px 40px #0002}
.step-head{display:flex;align-items:center;gap:12px;margin-bottom:18px}.step-no{width:34px;height:34px;border-radius:10px;background:#294b3a;color:var(--green2);display:grid;place-items:center;font-weight:900}.step-head h3{margin:0;font-size:19px}.step-head p{margin:2px 0 0;color:var(--muted);font-size:13px}
label{display:block;font-weight:700;font-size:13px;margin:12px 0 7px}textarea,select,input[type=text]{width:100%;background:#111722;color:var(--text);border:1px solid #3b4659;border-radius:11px;padding:12px;outline:none}textarea:focus,select:focus{border-color:var(--green)}
textarea{min-height:112px;resize:vertical}.controls{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.actions{display:flex;align-items:center;gap:13px;flex-wrap:wrap;margin-top:17px}
.hint,.muted{color:var(--muted);font-size:13px}.message{color:var(--green2);font-size:13px;min-height:20px}
.results{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px;margin-top:20px}.result-card{background:#111722;border:1px solid var(--line);border-radius:14px;padding:12px}.result-card img{display:block;width:100%;aspect-ratio:1/1;object-fit:contain;background:#0c1119;border-radius:9px}.result-card .actions{margin-top:10px}
.preview{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(240px,.8fr);gap:20px;align-items:start}.preview img{width:100%;display:block;background:#0c1119;border:1px solid var(--line);border-radius:13px;min-height:180px;object-fit:contain}
.checklist{display:grid;gap:10px}.check{display:flex;align-items:flex-start;gap:10px;background:#121a25;border:1px solid #303b4d;padding:11px;border-radius:10px;font-size:13px}.check input{margin-top:3px;accent-color:var(--green)}
.note{border-left:3px solid var(--green);background:#17251f;padding:12px 14px;border-radius:0 10px 10px 0;color:#d5f4e0;font-size:13px;margin-top:14px}
footer{text-align:center;color:#7f8b9e;font-size:12px;margin-top:28px}
@media(max-width:720px){.controls,.preview{grid-template-columns:1fr}.top{align-items:flex-start;flex-direction:column}.card{padding:16px}.studio{padding:20px 13px 40px}}
</style>
<div class="studio">
  <header class="top">
    <div class="brand"><div class="brandmark">R</div><div><h1>ROYALTY 2D STUDIO</h1><p>CHARACTER DESIGN & RIG PREPARATION</p></div></div>
    <span class="status-pill">AI connection ready to test</span>
  </header>
  <section class="hero">
    <div class="eyebrow">A SIMPLE PRODUCTION WORKFLOW</div>
    <h2>Bring your character to life.</h2>
    <p>Create a paired character reference sheet, prepare it for animation, then download the artwork and production notes for Moho 14 or Cartoon Animator 5.</p>
  </section>

  <section class="card" id="generate-section">
    <div class="step-head"><span class="step-no">1</span><div><h3>Generate your character</h3><p>One character, shown in two matching views.</p></div></div>
    <label for="character-prompt">Describe the character</label>
    <textarea id="character-prompt" maxlength="1200" placeholder="Example: A cheerful village storyteller, short and round, wearing a blue jacket, brown trousers and oversized boots."></textarea>
    <div class="controls">
      <div><label for="character-style">Art style</label><select id="character-style"><option value="2d">Classic 2D cartoon</option><option value="3d">Polished 3D cartoon</option><option value="both">Choose from my description</option></select></div>
      <div><label for="character-quality">Detail</label><select id="character-quality"><option value="medium">Draft</option><option value="high" selected>Detailed</option><option value="xhigh">Extra detailed</option></select></div>
      <div><label for="character-count">Number of options</label><select id="character-count"><option value="1" selected>1 option</option><option value="2">2 options</option><option value="3">3 options</option></select></div>
    </div>
    <p class="hint">Every option is requested as one sheet: front A-pose on the left and side profile on the right. Humans, animals, birds, robots and fantasy creatures should retain their natural anatomy.</p>
    <div class="actions"><button class="primary" id="generate-button">✦ Generate character sheet</button><span class="message" id="generate-status" role="status" aria-live="polite">Ready when you are.</span></div>
    <div class="results" id="generated-results" hidden></div>
  </section>

  <section class="card" id="prepare-section">
    <div class="step-head"><span class="step-no">2</span><div><h3>Rig / prepare for animation</h3><p>Choose a generated sheet and complete the preparation checklist.</p></div></div>
    <div class="preview">
      <div><img id="selected-preview" alt="Selected character reference sheet" hidden><p class="muted" id="preview-empty">Your selected character sheet will appear here.</p></div>
      <div>
        <div class="checklist">
          <label class="check"><input type="checkbox" class="prep-check"> Confirm the front A-pose is full-body, with hands and feet visible.</label>
          <label class="check"><input type="checkbox" class="prep-check"> Confirm the side profile matches the same character and proportions.</label>
          <label class="check"><input type="checkbox" class="prep-check"> Plan separate layers for head, torso, upper/lower arms, hands, thighs, shins, feet, tail, wings and accessories as applicable.</label>
          <label class="check"><input type="checkbox" class="prep-check"> Plan hidden overlap artwork behind shoulders, elbows, hips and knees before separating parts.</label>
          <label class="check"><input type="checkbox" class="prep-check"> Mark pivot locations and test the separated layers in the target animation app.</label>
        </div>
        <div class="note"><strong>Important:</strong> This stage prepares a reference sheet and checklist. A single flattened AI image is not yet a true layered, deformable rig. Hidden body areas must be reconstructed and parts separated in an art editor before rigging in Moho or Cartoon Animator.</div>
      </div>
    </div>
  </section>

  <section class="card" id="download-section">
    <div class="step-head"><span class="step-no">3</span><div><h3>Download your production files</h3><p>Save the selected sheet and a preparation guide.</p></div></div>
    <div class="actions">
      <button class="primary" id="download-image" disabled>↓ Download character sheet</button>
      <button class="secondary" id="download-guide" disabled>↓ Download rig-preparation notes</button>
    </div>
    <p class="hint">The notes explain the layer and pivot preparation to complete before importing into Moho 14 or Cartoon Animator 5. This version does not claim to create native project files for either application.</p>
    <div class="message" id="download-status" role="status" aria-live="polite"></div>
  </section>
  <footer>ROYALTY 2D STUDIO · Generate · Prepare · Download</footer>
</div>`;

const promptEl = $('#character-prompt');
const statusEl = $('#generate-status');
const resultsEl = $('#generated-results');
const generateButton = $('#generate-button');
const previewEl = $('#selected-preview');
const previewEmpty = $('#preview-empty');
const downloadImageButton = $('#download-image');
const downloadGuideButton = $('#download-guide');

function bytesFromBase64(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function saveBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function selectImage(index) {
  const item = state.images[index];
  if (!item) return;
  state.selectedIndex = index;
  state.prepared = true;
  previewEl.src = `data:${state.mimeType};base64,${item}`;
  previewEl.hidden = false;
  previewEmpty.hidden = true;
  downloadImageButton.disabled = false;
  downloadGuideButton.disabled = false;
  $$('.result-card').forEach((card, i) => card.style.borderColor = i === index ? '#73e0a0' : '#303b4d');
  $('#download-status').textContent = `Option ${index + 1} selected.`;
}

function renderResults() {
  resultsEl.replaceChildren();
  state.images.forEach((item, index) => {
    const card = document.createElement('article');
    card.className = 'result-card';
    const image = document.createElement('img');
    image.alt = `Generated character turnaround sheet ${index + 1}`;
    image.src = `data:${state.mimeType};base64,${item}`;
    const row = document.createElement('div');
    row.className = 'actions';
    const choose = document.createElement('button');
    choose.className = 'primary';
    choose.type = 'button';
    choose.textContent = 'Select this sheet';
    choose.addEventListener('click', () => selectImage(index));
    row.append(choose);
    card.append(image, row);
    resultsEl.append(card);
  });
  resultsEl.hidden = !state.images.length;
  if (state.images.length) selectImage(0);
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
  statusEl.textContent = 'Creating your paired character sheet. This can take a little while.';

  const style = $('#character-style').value;
  const quality = $('#character-quality').value;
  const count = Number($('#character-count').value) || 1;

  const composition = [
    'Create ONE clean professional character turnaround reference SHEET on a plain, uncluttered, light neutral studio background.',
    'Show EXACTLY TWO full-body views of THE SAME character, side by side with clear space between them.',
    'LEFT: front-facing neutral A-POSE, arms angled slightly downward from the shoulders, hands visible, legs slightly apart, feet fully visible.',
    'RIGHT: exact side-profile view of the same character, standing naturally and facing right.',
    'Both views must have matching design, anatomy, proportions, clothing, colours, markings, accessories and details.',
    'Adapt the natural anatomy to the subject: quadrupeds stand on all four legs; birds stand naturally with wings visible; creatures retain their real limbs, wings, tails, horns or other features.',
    'Keep both views fully inside the frame. No cropped body parts, extra characters, extra views, labels, captions, watermark, logo, border, collage panels or decorative text.',
    `Character brief: ${brief}.`,
    `Art direction: ${styleText[style]}.`
  ].join(' ');

  // The Cloudflare Worker enforces a 2048-character prompt limit.
  const finalPrompt = composition.slice(0, 2048);

  try {
    const apiBase = (import.meta.env.VITE_AI_API_BASE_URL || '').replace(/\/$/, '');
    if (!apiBase) throw new Error('The AI API address is missing. Check the VITE_AI_API_BASE_URL setting in Cloudflare Pages.');
    const response = await fetch(`${apiBase}/api/character/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: finalPrompt,
        style: style === 'both' ? 'auto' : style,
        steps: quality === 'medium' ? 3 : quality === 'xhigh' ? 4 : 4,
        n: count
      })
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.success === false) {
      throw new Error(payload.error || `AI service returned ${response.status}.`);
    }

    const images = Array.isArray(payload.images) ? payload.images : (payload.imageBase64 ? [payload.imageBase64] : []);
    if (!images.length) throw new Error('The AI service returned no images. Please try again.');
    state.images = images;
    state.mimeType = payload.mimeType || 'image/jpeg';
    renderResults();
    statusEl.textContent = `Generated ${images.length} option${images.length === 1 ? '' : 's'} using ${payload.model || 'Cloudflare AI'}. Please inspect both views before production.`;
    $('#generated-results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) {
    statusEl.textContent = error.message.includes('Failed to fetch')
      ? 'Could not reach the AI service. Check that the existing Cloudflare Worker is deployed and the API address is configured.'
      : error.message;
  } finally {
    generateButton.disabled = false;
    generateButton.textContent = '✦ Generate character sheet';
  }
}

function downloadSelectedImage() {
  const item = state.images[state.selectedIndex];
  if (!item) return;
  const extension = state.mimeType === 'image/png' ? 'png' : 'jpg';
  saveBlob(`royalty-character-turnaround.${extension}`, new Blob([bytesFromBase64(item)], { type: state.mimeType }));
  $('#download-status').textContent = 'Character sheet download started.';
}

function downloadPreparationGuide() {
  if (!state.images[state.selectedIndex]) return;
  const guide = `ROYALTY 2D STUDIO — CHARACTER RIG PREPARATION NOTES

Selected character sheet: royalty-character-turnaround
Target applications: Moho 14 or Cartoon Animator 5

IMPORTANT
This downloaded reference is a flattened image. It is not a native layered rig or a ready-to-deform character project.

PREPARATION WORKFLOW
1. Open the reference in your drawing or image-editing application.
2. Create a separate transparent layer for each movable part that applies to this character.
3. Typical humanoid layers: head, neck, torso, upper arm L/R, forearm L/R, hand L/R, thigh L/R, shin L/R and foot L/R.
4. For animals and fantasy characters, adapt the parts to their anatomy: body, head, neck, upper/lower limbs, paws/feet, tail, wings, ears, horns and accessories as needed.
5. Reconstruct hidden artwork behind joints. Parts must overlap enough to avoid gaps when bent.
6. Keep the front view and side view as matching references. Usually rig one view at a time; do not combine both views into one deforming puppet.
7. Export each part as a transparent PNG with consistent canvas dimensions and alignment.
8. Mark pivot points at shoulders, elbows, wrists, hips, knees, ankles, neck and tail/wings where appropriate.
9. Import the separated layers into Moho 14 or Cartoon Animator 5 and build/test the native bone rig there.
10. Test extreme poses for gaps, stretching and unwanted intersections; correct the artwork before final animation.

QUALITY CHECK
[ ] Front A-pose full body visible
[ ] Side profile full body visible
[ ] Same character design in both views
[ ] Separate transparent body-part layers created
[ ] Hidden joint overlaps reconstructed
[ ] Pivot points checked
[ ] Native rig tested in target application

Generated by Royalty 2D Studio.
`;
  saveBlob('royalty-rig-preparation-notes.txt', new Blob([guide], { type: 'text/plain;charset=utf-8' }));
  $('#download-status').textContent = 'Rig-preparation notes download started.';
}

generateButton.addEventListener('click', generateCharacter);
downloadImageButton.addEventListener('click', downloadSelectedImage);
downloadGuideButton.addEventListener('click', downloadPreparationGuide);
