const MODEL = "@cf/black-forest-labs/flux-1-schnell";
const MAX_PROMPT_LENGTH = 2000;

function corsHeaders(env) {
  return {
    "access-control-allow-origin": env.ALLOWED_ORIGIN || "*",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "Content-Type, Authorization",
    "access-control-max-age": "86400",
    "Vary": "Origin",
  };
}

function jsonResponse(data, status, env) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(env),
    },
  });
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function imageToBase64(result) {
  if (result && typeof result === "object" && "image" in result) {
    result = result.image;
  }
  if (typeof result === "string") {
    return result.replace(/^data:image\/[^;]+;base64,/, "");
  }
  if (result instanceof Blob) {
    return bytesToBase64(new Uint8Array(await result.arrayBuffer()));
  }
  if (result instanceof ArrayBuffer) {
    return bytesToBase64(new Uint8Array(result));
  }
  if (ArrayBuffer.isView(result)) {
    return bytesToBase64(new Uint8Array(result.buffer, result.byteOffset, result.byteLength));
  }
  throw new Error("Cloudflare AI returned an unsupported image format.");
}

function detectStyle(prompt, requestedStyle) {
  const choice = String(requestedStyle || "auto").toLowerCase();
  if (choice === "2d" || choice === "3d") return choice;

  const text = prompt.toLowerCase();
  const threeD = ["3d", "three-dimensional", "three dimensional", "cgi", "blender render", "sculpted 3d"];
  const twoD = ["2d", "two-dimensional", "two dimensional", "hand-drawn", "hand drawn", "anime", "manga", "flat illustration", "vector illustration", "storybook illustration", "comic illustration"];

  if (threeD.some(word => text.includes(word))) return "3d";
  if (twoD.some(word => text.includes(word))) return "2d";
  return "2d";
}

function enhancePrompt(prompt, style) {
  const artDirection = style === "3d"
    ? "Premium stylized 3D animated character artwork, dimensional sculpted forms, appealing materials, detailed textures and professional 3D lighting."
    : "Professional 2D animated character illustration, expressive clean linework, deliberate shapes, beautifully finished colours and polished cartoon artwork.";

  return `${prompt}\n\nART DIRECTION: ${artDirection}\n\nFULL BODY AND ANATOMY: When the requested framing is full body, show the complete character from the top of the head to the soles of both feet. Keep the whole character inside the image with clear space above and below. Exactly two arms and two legs for an ordinary humanoid character. Show two distinct feet, naturally separated and clearly formed. Avoid accidentally merged, duplicated, missing or cropped limbs. Use natural readable anatomy and a centred composition. Respect unusual anatomy if the user explicitly requests a creature with a different number of limbs.\n\nFINISH: Preserve the user's requested character, clothing, colours, pose and artistic direction. Make facial features and details sharp and clear. No unwanted lettering, watermark, logo, border or signature.`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    if (path === "/" && request.method === "GET") {
      return jsonResponse({
        success: true,
        service: "Royalty 2D Studio AI",
        status: "online",
        model: MODEL,
        aiBindingConfigured: Boolean(env.AI),
        supportedStyles: ["2d", "3d", "auto"],
        endpoint: "/api/character/generate",
      }, 200, env);
    }

    if (path === "/api/character/generate" && request.method === "GET") {
      return jsonResponse({
        success: true,
        endpoint: "/api/character/generate",
        method: "POST",
        supportedStyles: ["2d", "3d", "auto"],
        example: { prompt: "A friendly cartoon explorer", style: "3d", steps: 4, n: 1 },
      }, 200, env);
    }

    if (path !== "/api/character/generate") {
      return jsonResponse({ success: false, error: "Route not found." }, 404, env);
    }
    if (request.method !== "POST") {
      return jsonResponse({ success: false, error: "Use POST to generate a character." }, 405, env);
    }

    try {
      if (!env.AI) throw new Error("Workers AI binding AI is not configured.");

      let body;
      try {
        body = await request.json();
      } catch {
        return jsonResponse({ success: false, error: "Request body must be valid JSON." }, 400, env);
      }

      const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
      if (!prompt) return jsonResponse({ success: false, error: "Please provide a character description." }, 400, env);
      if (prompt.length > MAX_PROMPT_LENGTH) {
        return jsonResponse({ success: false, error: `Keep the prompt under ${MAX_PROMPT_LENGTH} characters.` }, 400, env);
      }

      const style = detectStyle(prompt, body.style);
      const requestedSteps = Number(body.steps ?? 4);
      const steps = Number.isFinite(requestedSteps) ? Math.min(4, Math.max(1, Math.floor(requestedSteps))) : 4;
      const requestedCount = Number(body.n ?? 1);
      const count = Number.isFinite(requestedCount) ? Math.min(4, Math.max(1, Math.floor(requestedCount))) : 1;
      const enhancedPrompt = enhancePrompt(prompt, style);

      console.log("Character generation requested", { style, count, steps, model: MODEL });

      // Generate sequentially to keep resource use predictable on the free plan.
      const images = [];
      for (let i = 0; i < count; i++) {
        const result = await env.AI.run(MODEL, {
          prompt: enhancedPrompt,
          steps,
        });
        images.push(await imageToBase64(result));
      }

      return jsonResponse({
        success: true,
        service: "Royalty 2D Studio AI",
        model: MODEL,
        style,
        prompt,
        steps,
        count: images.length,
        mimeType: "image/jpeg",
        images,
        // First-image fields retained for simple PowerShell testing/backward compatibility.
        imageBase64: images[0],
        imageDataUrl: `data:image/jpeg;base64,${images[0]}`,
        message: `${style.toUpperCase()} character generation completed.`,
      }, 200, env);
    } catch (error) {
      console.error("Royalty 2D Studio AI generation failed:", error?.stack || error?.message || String(error));
      return jsonResponse({
        success: false,
        error: "Character generation failed. Check the Worker logs for the detailed error, then try again.",
      }, 502, env);
    }
  },
};
