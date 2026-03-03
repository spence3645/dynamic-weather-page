import Anthropic from '@anthropic-ai/sdk';

const SCENES = [
  'solitary mountain peak with distant layered ranges',
  'rolling hills with a single winding road disappearing into the horizon',
  'desert dunes with a lone cactus silhouette',
  'ocean horizon with a distant lighthouse on a rocky outcrop',
  'dense pine forest with layered tree-line silhouettes',
  'arctic plain with gentle ice ridge formations',
  'city skyline with simple geometric building silhouettes',
  'coastal cliffs descending to a calm sea',
  'open prairie with a grain silo on the horizon',
  'calm lake surrounded by mountain ranges',
  'volcanic ridge with dramatic asymmetric slopes',
  'bamboo grove with overlapping vertical stalks',
];

const FONTS = [
  { family: 'Raleway', url: 'Raleway:wght@100;200;300', weight: '100' },
  { family: 'Montserrat', url: 'Montserrat:wght@100;200;300', weight: '100' },
  { family: 'Jost', url: 'Jost:wght@100;200;300', weight: '100' },
  { family: 'Cormorant Garamond', url: 'Cormorant+Garamond:wght@300;400', weight: '300' },
];

function buildPage({ location, datetime, temperature, condition, svgContent, font, darkText }) {
  const textColor = darkText ? 'rgba(15,15,15,0.9)' : 'rgba(255,255,255,0.95)';
  const mutedColor = darkText ? 'rgba(15,15,15,0.5)' : 'rgba(255,255,255,0.5)';
  const shadow = darkText
    ? '0 1px 12px rgba(255,255,255,0.3)'
    : '0 1px 20px rgba(0,0,0,0.6)';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Philadelphia Weather</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${font.url}&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #111; }

    .scene {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
    }
    .scene svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    .weather {
      position: fixed;
      top: 60px;
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
      font-family: '${font.family}', sans-serif;
      text-shadow: ${shadow};
      z-index: 10;
      display: flex;
      flex-direction: column;
      gap: 0;
      white-space: nowrap;
    }

    .location {
      font-size: 11px;
      font-weight: 300;
      letter-spacing: 0.38em;
      text-transform: uppercase;
      color: ${mutedColor};
      margin-bottom: 6px;
    }

    .datetime {
      font-size: 10px;
      font-weight: 300;
      letter-spacing: 0.25em;
      color: ${mutedColor};
      opacity: 0.75;
      margin-bottom: 20px;
    }

    .temperature {
      font-size: clamp(72px, 10vw, 104px);
      font-weight: ${font.weight};
      letter-spacing: -0.02em;
      line-height: 1;
      color: ${textColor};
      margin-bottom: 10px;
    }

    .condition {
      font-size: 12px;
      font-weight: 300;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: ${mutedColor};
    }
  </style>
</head>
<body>
  <div class="scene">${svgContent}</div>
  <div class="weather">
    <div class="location">${location}</div>
    <div class="datetime">${datetime}</div>
    <div class="temperature">${temperature}</div>
    <div class="condition">${condition}</div>
  </div>
</body>
</html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { location, datetime, temperature, condition, weatherEffect, isDay } = req.body || {};

  if (!location || !datetime || !temperature || !condition || !weatherEffect) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const scene = SCENES[Math.floor(Math.random() * SCENES.length)];
  const font = FONTS[Math.floor(Math.random() * FONTS.length)];

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `You are a generative SVG artist. Return ONLY a single <svg> element — no HTML wrapper, no markdown, no explanation.

The SVG must use viewBox="0 0 1440 900" and fill the full viewport. It contains three layers in order:

══ LAYER 1: SKY ══
A <rect width="1440" height="900"> filled with a <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"> using 2–3 color stops. Choose colors that match the weather and time of day:
• Clear day → pale sky blue (#87CEEB) → warm haze near horizon (#E8D5B7)
• Clear night → deep navy (#0a0f2e) → dark indigo (#1a1040) at horizon
• Overcast/rain → dark charcoal (#2d3540) → muted blue-grey (#3d4a5c)
• Snow → steel blue (#3a4f6e) → icy pale (#c8d8e8)
• Storm → near-black (#1a1520) → dark purple-grey (#2d2035)
• Fog → uniform pale silver (#c8ccce) to slightly lighter (#dde0e2)

══ LAYER 2: LANDSCAPE SILHOUETTE ══
Render the scene: "${scene}"

Use exactly 3 <path> elements stacked back to front. Each path is a filled silhouette that spans full width (x: 0→1440) and closes at y=900.
• Path 1 (background): opacity 0.3–0.45, lightest shade, highest peaks/forms
• Path 2 (mid): opacity 0.55–0.75, medium shade, mid-height forms
• Path 3 (foreground): opacity 1, darkest shade, lowest anchored silhouette

Choose fill colors as desaturated tones darker than the horizon sky color — they should feel like they belong to the same palette. Mountain peaks use M x,y L x,y zigzag paths. Tree lines use repeated short M/L curves. Buildings use rectangular M/L/z paths. Adjust the silhouette style to match the scene type.

══ LAYER 3: WEATHER EFFECT ══
Add atmosphere for "${weatherEffect}" using CSS @keyframes in a <style> inside the <svg>:

sun → One large radial gradient circle (r=160–220) near upper-center (cx≈720, cy≈200), gradient from rgba(255,240,180,0.55) center to transparent. Add 8 thin <line> elements as rays radiating from center, stroke rgba(255,240,180,0.2), animated to rotate: use <animateTransform type="rotate" from="0 720 200" to="360 720 200" dur="80s" repeatCount="indefinite"> on a wrapping <g>.

stars → 35 <circle> elements, r=0.6–2.2, fill="white", scattered across y=0–550. Each has a unique cx/cy and CSS animation: @keyframes twinkle { 0%,100%{opacity:0.15} 50%{opacity:0.9} } with varied duration (2–5s) and animation-delay applied via style attribute.

clouds → 4 cloud groups, each a <g> of 3–4 overlapping <ellipse> elements (fill white or light grey, opacity 0.12–0.18). Position in y=30–250 range. Animate each group with CSS: @keyframes drift { from{transform:translateX(0)} to{transform:translateX(180px)} } duration 35–65s, linear, alternate infinite. Stagger delays.

fog → 3 wide <rect> elements (width=1800, height=90–160, fill="white" or "#dde", opacity=0.05–0.09) at different y positions in the mid-sky. CSS animation: @keyframes fogdrift { 0%{transform:translateX(-200px)} 100%{transform:translateX(200px)} } duration 25–40s, alternate infinite, staggered delays.

rain → CSS in <style>: @keyframes fall { from{transform:translateY(-60px)} to{transform:translateY(970px)} } — then 55 <line> elements inside a <g>, each: x1=x2 (same x), y1=0, y2=35, stroke="white", stroke-width="1", opacity="0.18". Set x1/x2 evenly spaced 0–1440. Each gets style="animation: fall Xs linear Ys infinite" with duration 0.55–1.0s and delay 0–2.5s varied per element.

snow → CSS: @keyframes snow { 0%{transform:translate(0,-10px)} 50%{transform:translate(12px,460px)} 100%{transform:translate(-8px,920px)} } — then 38 <circle> elements, r=1.5–4.5, fill="white", opacity=0.75–0.95. Set cx values spread 0–1440. Each gets style="animation: snow Xs ease-in-out Ys infinite" with duration 7–15s and delay 0–9s. Vary sizes across elements.

storm → Rain as above (55 lines, opacity 0.28, duration 0.38–0.65s) PLUS a <rect width="1440" height="900" fill="white" opacity="0" style="animation: lightning 9s infinite"/> with CSS: @keyframes lightning { 0%,91%,93%,95%,100%{opacity:0} 92%,94%{opacity:0.08} }

══ RULES ══
• Return ONLY the raw <svg>…</svg> element. Nothing else.
• No <text> elements — text is handled externally.
• No <html>, no <head>, no <body>, no markdown fences.
• All CSS in a <style> block inside the <svg>.
• Keep total output under 3500 tokens — use concise path data, avoid unnecessary precision.`;

  try {
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    });

    const message = await stream.finalMessage();
    let svgContent = message.content[0].text.trim();

    // Strip markdown fences if present
    svgContent = svgContent.replace(/^```svg\s*/i, '').replace(/^```xml\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

    // Detect whether the sky is light (parchment/fog/clear-day light variants) to use dark text
    const darkText = isDay && (weatherEffect === 'sun' || weatherEffect === 'clouds' || weatherEffect === 'fog');

    const html = buildPage({ location, datetime, temperature, condition, svgContent, font, darkText });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(html);
  } catch (err) {
    console.error('Claude API error:', err);
    return res.status(500).json({ error: 'Failed to generate page' });
  }
}
