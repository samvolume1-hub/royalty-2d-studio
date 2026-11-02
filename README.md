# ROYALTY 2D STUDIO — AI CHARACTER FORGE

A browser-based character concept and animation-preparation studio, connected to a separate Cloudflare Workers AI backend.

## Included in this package

- AI character generation inside the studio interface.
- 2D, 3D and automatic style selection.
- Prompt controls for full-body, portrait, dynamic-pose and concept-sheet framing.
- 1–4 sequential image variations per request (each variation is a separate model call).
- Generated-image previews, downloads and loading into the character canvas.
- Existing local vector character tools, project save/import, PNG import, starter rig preparation, animation lab, audio-driven mouth blocking and exports.
- Cloudflare Worker source in `worker/index.js`.

## Important notes

- The configured model is `@cf/black-forest-labs/flux-1-schnell`.
- The Worker returns JPEG image data. The current model does not provide transparent-background output through this integration.
- Strong anatomy and full-body instructions improve prompts but cannot guarantee perfect hands, feet or limb placement. Image inspection and automatic regeneration are future enhancements.
- The current rigging workflow creates starter guides and approximate body-part masks. It is not a fully deformable production skeletal rig. Exact multi-view identity consistency and layered character editing remain future work.
- Cloudflare model availability, free allocations, account requirements and pricing can change. Check Cloudflare's current Workers AI pricing and model documentation before relying on a usage allowance. The project does not intentionally upgrade an account or add paid services.

## 1. Run the studio locally on Windows

1. Install Node.js LTS from https://nodejs.org/en/download.
2. Extract this ZIP into a folder such as `C:\Royalty2DStudio`.
3. Open that folder in PowerShell or VS Code terminal.
4. Run:

```powershell
npm install
npm run dev
```

5. Open the local Vite address, normally `http://localhost:5173`.

The included `.env.local` points the local Vite `/api` proxy to the already-created Worker:

`https://royalty-2d-studio-ai.samvolume1.workers.dev`

If you change the Worker URL, edit `AI_WORKER_URL` in `.env.local` and restart the dev server.

## 2. Cloudflare Worker

The deployed Worker is named `royalty-2d-studio-ai`. Its Workers AI binding must remain named exactly `AI`.

The Worker source is `worker/index.js`. To update it through the Cloudflare dashboard:

1. Open Workers & Pages.
2. Select `royalty-2d-studio-ai` (do not select or change Royalty Music Hub).
3. Open Edit Code.
4. Replace the Worker editor contents with `worker/index.js` from this package.
5. Deploy and wait for Ready.

The Worker supports POST `/api/character/generate` with JSON fields `prompt`, `style` (`2d`, `3d` or `auto`), `steps` (1–4) and `n` (1–4). Variations are generated sequentially to avoid parallel bursts.

## 3. Host the frontend on Cloudflare Pages

This project uses Vite. Connect a **new, separate GitHub repository** for Royalty 2D Studio to Cloudflare Pages. Do not use or modify the Royalty Music Hub repository or Worker.

Suggested Pages build settings:

- Framework preset: Vite
- Build command: `npm run build`
- Build output directory: `dist`

Set this build environment variable in Pages:

`VITE_AI_API_BASE_URL=https://royalty-2d-studio-ai.samvolume1.workers.dev`

After the first Pages deployment, copy its exact site origin (for example, `https://your-project.pages.dev`). Then set the Worker environment variable `ALLOWED_ORIGIN` to that exact origin and redeploy the Worker. Do not leave `*` as the production origin. For local testing, the Worker may use `http://localhost:5173` as its allowed origin.

## 4. Tests and build

Run source tests:

```powershell
npm test
```

Create the production frontend bundle:

```powershell
npm run build
```

The source test suite checks the core UI controls, project workflow, rigging helpers and AI integration source. A passing source test does not replace a live end-to-end browser test against the deployed Worker.

## 5. API test with PowerShell

```powershell
$uri = "https://royalty-2d-studio-ai.samvolume1.workers.dev/api/character/generate"
$body = @{
    prompt = "A cheerful African girl cartoon character, full body, wearing colourful clothes"
    style = "2d"
    steps = 4
    n = 1
} | ConvertTo-Json
$result = Invoke-RestMethod -Uri $uri -Method Post -ContentType "application/json" -Body $body
$result.success
$result.style
```

The response includes `images` (an array for the studio) and `imageBase64` / `imageDataUrl` for simple single-image tests.
